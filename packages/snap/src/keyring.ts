import { isValidAddress, toChecksumAddress } from '@ethereumjs/util';
import type {
  Keyring,
  KeyringAccount,
  KeyringRequest,
  SubmitRequestResponse,
} from '@metamask/keyring-api';
import { emitSnapKeyringEvent, EthAccountType } from '@metamask/keyring-api';
import { KeyringEvent } from '@metamask/keyring-api/dist/events';
import { type Hex, isValidHexAddress, type Json } from '@metamask/utils';
import { v4 as uuid } from 'uuid';

import { saveState } from './stateManagement';
import { isEvmChain, isUniqueAddress, throwError } from './util';
import packageInfo from '../package.json';

export type KeyringState = {
  wallets: Record<string, Wallet>;
  pendingRequests: Record<string, KeyringRequest>;
  useSyncApprovals: boolean;
};

export type Wallet = {
  account: KeyringAccount;
  privateKey: string;
};

export class WatchOnlyKeyring implements Keyring {
  #state: KeyringState;

  constructor(state: KeyringState) {
    this.#state = state;
  }

  async listAccounts(): Promise<KeyringAccount[]> {
    return Object.values(this.#state.wallets).map((wallet) => wallet.account);
  }

  async getAccount(id: string): Promise<KeyringAccount> {
    return (
      this.#state.wallets[id]?.account ??
      throwError(`Account '${id}' not found`)
    );
  }

  async createAccount(
    options: Record<string, Json> = {},
  ): Promise<KeyringAccount> {
    if (!options?.address) {
      throw new Error('Account creation options must include an address');
    }

    if (
      !isValidHexAddress(options.address as Hex) &&
      !isValidAddress(options.address as string)
    ) {
      throw new Error(`Invalid address: ${options.address as string}`);
    }

    // Import watch-only account from public address.
    const address = toChecksumAddress(options.address as string);

    if (!isUniqueAddress(address, Object.values(this.#state.wallets))) {
      throw new Error(`Account address already in use: ${address}`);
    }

    try {
      const account: KeyringAccount = {
        id: uuid(),
        // No options are supported for watch-only accounts.
        options: {},
        address,
        // No methods are supported for watch-only accounts.
        methods: [],
        type: EthAccountType.Eoa,
      };
      await this.#emitEvent(KeyringEvent.AccountCreated, { account });
      this.#state.wallets[account.id] = {
        account,
        privateKey: '', // Store an empty privateKey for watch-only accounts.
      };
      await this.#saveState();
      return account;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async filterAccountChains(_id: string, chains: string[]): Promise<string[]> {
    // The `id` argument is not used because all accounts created by this snap
    // are expected to be compatible with any EVM chain.
    return chains.filter((chain) => isEvmChain(chain));
  }

  async updateAccount(account: KeyringAccount): Promise<void> {
    const wallet =
      this.#state.wallets[account.id] ??
      throwError(`Account '${account.id}' not found`);

    wallet.account = {
      ...wallet.account,
      ...account,
      // Restore read-only properties.
      address: wallet.account.address,
      methods: wallet.account.methods,
      type: wallet.account.type,
      options: wallet.account.options,
    };

    await this.#saveState();
    await this.#emitEvent(KeyringEvent.AccountUpdated, {
      account: wallet.account,
    });
  }

  async deleteAccount(id: string): Promise<void> {
    try {
      await this.#emitEvent(KeyringEvent.AccountDeleted, { id });
      delete this.#state.wallets[id];
      await this.#saveState();
    } catch (error) {
      throwError((error as Error).message);
    }
  }

  async listRequests(): Promise<KeyringRequest[]> {
    return Object.values(this.#state.pendingRequests);
  }

  async getRequest(id: string): Promise<KeyringRequest> {
    return (
      this.#state.pendingRequests[id] ?? throwError(`Request '${id}' not found`)
    );
  }

  async submitRequest(request: KeyringRequest): Promise<SubmitRequestResponse> {
    return this.#state.useSyncApprovals
      ? this.#syncSubmitRequest(request)
      : this.#asyncSubmitRequest(request);
  }

  async approveRequest(id: string): Promise<void> {
    await this.#removePendingRequest(id);
    await this.#emitEvent(KeyringEvent.RequestRejected, { id });
    throwError('Signing is not supported in this watch-only account snap.');
  }

  async rejectRequest(id: string): Promise<void> {
    if (this.#state.pendingRequests[id] === undefined) {
      throw new Error(`Request '${id}' not found`);
    }

    await this.#removePendingRequest(id);
    await this.#emitEvent(KeyringEvent.RequestRejected, { id });
  }

  async toggleSyncApprovals(): Promise<void> {
    this.#state.useSyncApprovals = !this.#state.useSyncApprovals;
    await this.#saveState();
  }

  isSynchronousMode(): boolean {
    return this.#state.useSyncApprovals;
  }

  async #removePendingRequest(id: string): Promise<void> {
    delete this.#state.pendingRequests[id];
    await this.#saveState();
  }

  #getCurrentUrl(): string {
    const dappUrlPrefix =
      process.env.NODE_ENV === 'production'
        ? process.env.DAPP_ORIGIN_PRODUCTION
        : process.env.DAPP_ORIGIN_DEVELOPMENT;
    const dappVersion: string = packageInfo.version;

    // Ensuring that both dappUrlPrefix and dappVersion are truthy
    if (dappUrlPrefix && dappVersion && process.env.NODE_ENV === 'production') {
      return `${dappUrlPrefix}${dappVersion}/`;
    }
    // Default URL if dappUrlPrefix or dappVersion are falsy, or if URL construction fails
    return dappUrlPrefix as string;
  }

  async #asyncSubmitRequest(
    request: KeyringRequest,
  ): Promise<SubmitRequestResponse> {
    this.#state.pendingRequests[request.id] = request;
    await this.#saveState();
    const dappUrl = this.#getCurrentUrl();
    return {
      pending: true,
      redirect: {
        url: dappUrl,
        message: 'Watch-only accounts do not support signing. Redirecting...',
      },
    };
  }

  async #syncSubmitRequest(
    request: KeyringRequest,
  ): Promise<SubmitRequestResponse> {
    throwError(
      `Signing is not supported for this watch-only account snap.\nRequest: ${JSON.stringify(
        request,
        null,
        2,
      )}`,
    );
  }

  async #saveState(): Promise<void> {
    await saveState(this.#state);
  }

  async #emitEvent(
    event: KeyringEvent,
    data: Record<string, Json>,
  ): Promise<void> {
    await emitSnapKeyringEvent(snap, event, data);
  }
}
