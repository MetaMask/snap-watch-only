import type { KeyringAccount } from '@metamask/keyring-api';
import { installSnap } from '@metamask/snaps-jest';
import { v4 as uuid } from 'uuid';

import type { KeyringState } from '../keyring';
import { WatchOnlyKeyring } from '../keyring';

describe('WatchOnlyKeyring', () => {
  let keyring: WatchOnlyKeyring;
  let state: KeyringState;
  let accountId: string;

  beforeEach(async () => {
    accountId = uuid();
    state = {
      wallets: {
        [accountId]: {
          account: {
            id: accountId,
            address: '0x1',
            type: 'eip155:eoa',
            options: {},
            methods: [],
          },
          privateKey: '',
        },
      },
      pendingRequests: {},
      useSyncApprovals: false,
    };
    keyring = new WatchOnlyKeyring(state);
    await installSnap();
  });

  it('should initialize with provided state', async () => {
    expect(await keyring.getAccount(accountId)).toStrictEqual(
      state.wallets[accountId]?.account,
    );
    expect(await keyring.listRequests()).toStrictEqual([]);
    expect(keyring.isSynchronousMode()).toBe(false);
  });

  it('should retrieve an account correctly', async () => {
    const account = await keyring.getAccount(accountId);
    expect(account).toStrictEqual(state.wallets[accountId]?.account);
  });

  it('should throw error for nonexistent account', async () => {
    await expect(keyring.getAccount('nonexistent')).rejects.toThrow(
      "Account 'nonexistent' not found",
    );
  });

  it('should return the correct list of accounts', async () => {
    const accounts = await keyring.listAccounts();
    expect(accounts).toStrictEqual([
      {
        id: accountId,
        address: '0x1',
        type: 'eip155:eoa',
        options: {},
        methods: [],
      },
    ]);
  });

  it('should delete an account correctly', async () => {
    await keyring.deleteAccount(accountId);
    await expect(keyring.getAccount(accountId)).rejects.toThrow(
      "Account '0x1' not found",
    );
    expect(await keyring.listAccounts()).toStrictEqual([]);
  });

  it('should throw error when deleting a nonexistent account', async () => {
    await expect(keyring.deleteAccount('nonexistent')).rejects.toThrow(
      "Request 'nonexistent' not found",
    );
  });

  it('should create a new account without options', async () => {
    const newAccount = await keyring.createAccount();

    expect(typeof newAccount.address).toBe('string');
    expect(newAccount.address.length).toBeGreaterThan(2);
    expect(newAccount.address.startsWith('0x')).toBe(true);

    expect(typeof newAccount.id).toBe('string');
    expect(newAccount.id.length).toBeGreaterThan(0);

    expect(newAccount.methods).toStrictEqual([]);
    expect(newAccount.type).toBe('eip155:eoa');
    expect(newAccount.options).toStrictEqual({});
    expect(await keyring.getAccount(newAccount.id)).toStrictEqual(newAccount);
  });

  it('should import a watch-only account from a public address', async () => {
    const publicAddress = '0xPUBLIC';
    const newAccount = await keyring.createAccount({ address: publicAddress });
    expect(newAccount.address).toBe(publicAddress);
    const retrievedAccount = await keyring.getAccount(publicAddress);
    expect(retrievedAccount).toStrictEqual(newAccount);
  });

  it('should throw error for already used address', async () => {
    await expect(keyring.createAccount({ address: '0x1' })).rejects.toThrow(
      'Account address already in use: 0x1',
    );
  });

  it('should update an account correctly', async () => {
    const originalAccount = state.wallets[accountId]?.account;

    const updatedAccount: KeyringAccount = {
      type: originalAccount?.type ?? 'eip155:eoa',
      id: originalAccount?.id ?? accountId,
      address: originalAccount?.address ?? '0x1',
      methods: originalAccount?.methods ?? [],
      options: { ...originalAccount?.options, updated: true },
    };

    await keyring.updateAccount(updatedAccount);
    const retrievedAccount = await keyring.getAccount('0x1');
    expect(retrievedAccount.options).toStrictEqual({
      ...originalAccount?.options,
      updated: true,
    });
  });

  it('should throw error when updating a nonexistent account', async () => {
    const nonexistentAccount: KeyringAccount = {
      type: 'eip155:eoa',
      id: 'nonexistent',
      address: '0x1N0N3X1ST3NT',
      options: {},
      methods: ['personal_sign', 'eth_sign'],
    };
    await expect(keyring.updateAccount(nonexistentAccount)).rejects.toThrow(
      "Account 'nonexistent' not found",
    );
  });

  it('should list requests correctly', async () => {
    const requests = await keyring.listRequests();
    expect(requests).toStrictEqual(Object.values(state.pendingRequests));
  });

  it('should retrieve a request correctly', async () => {
    const request = await keyring.getRequest('sampleRequestId');
    expect(request).toStrictEqual(state.pendingRequests.sampleRequestId);
  });

  it('should toggle sync approvals', async () => {
    await keyring.toggleSyncApprovals();
    expect(keyring.isSynchronousMode()).toBe(true);
  });

  it('should return EVM compatible chains', async () => {
    const chains = ['evm1', 'evm2', 'nonEvm'];
    const filteredChains = await keyring.filterAccountChains('0x1', chains);
    expect(filteredChains).toStrictEqual(['evm1', 'evm2']);
  });

  it('should not allow the user to sign transactions', async () => {
    const result = await keyring.submitRequest({
      id: accountId,
      request: {
        method: 'eth_personalSign',
        params: [{ from: '0x1', to: '0x2', value: '0x0' }],
      },
      scope: '',
      account: '',
    });

    expect(result).toStrictEqual({
      pending: false,
      result: null,
      error: {
        code: -32601,
        message: 'Signing is not supported in this watch-only account snap.',
        data: null,
      },
    });
  });

  it('should not allow the user to send transactions', async () => {
    const result = await keyring.submitRequest({
      id: accountId,
      request: {
        method: 'eth_sendTransaction',
        params: [{ from: '0x1', to: '0x2', value: '0x1' }],
      },
      scope: '',
      account: '',
    });

    expect(result).toStrictEqual({
      pending: false,
      result: null,
      error: {
        code: -32601,
        message: 'Signing is not supported in this watch-only account snap.',
        data: null,
      },
    });
  });
});
