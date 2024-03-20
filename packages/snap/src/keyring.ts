import { isValidAddress, toChecksumAddress } from '@ethereumjs/util';
import type {
  Keyring,
  KeyringAccount,
  KeyringRequest,
  SubmitRequestResponse,
} from '@metamask/keyring-api';
import { emitSnapKeyringEvent, EthAccountType } from '@metamask/keyring-api';
import { KeyringEvent } from '@metamask/keyring-api/dist/events';
import type { Hex, Json } from '@metamask/utils';
import { isValidHexAddress } from '@metamask/utils';
import { v4 as uuid } from 'uuid';

import { saveState } from './stateManagement';
import { isEvmChain, isUniqueAddress, throwError } from './util';

export type KeyringState = {
  wallets: Record<string, Wallet>;
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

  async createAccount(options: { address: string }): Promise<KeyringAccount> {
    if (!options?.address) {
      throw new Error('Account creation options must include an address');
    }
    if (
      !isValidHexAddress(options.address as Hex) &&
      !isValidAddress(options.address)
    ) {
      throw new Error(`Invalid address '${options.address}' provided`);
    }
    const address = toChecksumAddress(options.address);

    if (!isUniqueAddress(address, Object.values(this.#state.wallets))) {
      throw new Error(`Account address already in use: ${address}`);
    }

    try {
      const account: KeyringAccount = {
        id: uuid(),
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
      throw new Error(`Unknown snap error: ${(error as Error).message}`);
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

    const newAccount: KeyringAccount = {
      ...wallet.account,
      ...account,
      // Restore read-only properties.
      address: wallet.account.address,
      methods: wallet.account.methods,
      type: wallet.account.type,
      options: wallet.account.options,
    };

    try {
      await this.#emitEvent(KeyringEvent.AccountUpdated, {
        account: newAccount,
      });
      wallet.account = newAccount;
      await this.#saveState();
    } catch (error) {
      throw new Error(`Unknown snap error: ${(error as Error).message}`);
    }
  }

  async deleteAccount(id: string): Promise<void> {
    const account = this.#state.wallets[id];

    if (!account) {
      throw new Error(`Account '${id}' not found`);
    }

    try {
      await this.#emitEvent(KeyringEvent.AccountDeleted, { id });
      delete this.#state.wallets[id];
      await this.#saveState();
    } catch (error) {
      throw new Error(`Unknown snap error: ${(error as Error).message}`);
    }
  }

  async submitRequest(request: KeyringRequest): Promise<SubmitRequestResponse> {
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
