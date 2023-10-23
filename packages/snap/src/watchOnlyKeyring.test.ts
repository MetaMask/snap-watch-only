import type { KeyringAccount, KeyringRequest } from '@metamask/keyring-api';

import type { KeyringState } from './keyring';
import { WatchOnlyKeyring } from './keyring';

describe('WatchOnlyKeyring', () => {
  let id: string, state: KeyringState, keyring: WatchOnlyKeyring;

  beforeEach(() => {
    id = '49116980-0712-4fa5-b045-e4294f1d440e';
    state = {
      wallets: {
        [id]: {
          account: {
            id,
            address: '0xE9A74AACd7df8112911ca93260fC5a046f8a64Ae',
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
  });

  describe('constructor', () => {
    it('should initialize with provided state', async () => {
      expect(await keyring.getAccount(id)).toStrictEqual(
        state.wallets[id]?.account,
      );
      expect(await keyring.listRequests()).toStrictEqual([]);
      expect(keyring.isSynchronousMode()).toBe(false);
    });
  });

  describe('getAccount', () => {
    it('should get an account by ID', async () => {
      const expectedResponse = {
        id: '49116980-0712-4fa5-b045-e4294f1d440e',
        address: '0xE9A74AACd7df8112911ca93260fC5a046f8a64Ae',
        options: {},
        methods: [],
        type: 'eip155:eoa',
      };
      const account = await keyring.getAccount(id);
      expect(account).toStrictEqual(expectedResponse);
    });
    it('should throw error for nonexistent account', async () => {
      await expect(keyring.getAccount('nonexistent')).rejects.toThrow(
        "Account 'nonexistent' not found",
      );
    });
  });

  describe('listAccounts', () => {
    it('should list accounts', async () => {
      const expectedResponse: KeyringAccount[] = [
        {
          id: '49116980-0712-4fa5-b045-e4294f1d440e',
          address: '0xE9A74AACd7df8112911ca93260fC5a046f8a64Ae',
          options: {},
          methods: [],
          type: 'eip155:eoa',
        },
      ];
      const accounts = await keyring.listAccounts();
      expect(accounts).toStrictEqual(expectedResponse);
    });
  });

  describe('createAccount', () => {
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
  });

  describe('createAccount with public address', () => {
    it('should import a watch-only account from a public address', async () => {
      const publicAddress = '0x1234567890AbcdEF1234567890aBcdef12345678';
      const newAccount = await keyring.createAccount({
        address: publicAddress,
      });
      expect(newAccount.address).toBe(publicAddress);
      const retrievedAccount = await keyring.getAccount(newAccount.id);
      expect(retrievedAccount).toStrictEqual(newAccount);
      expect(retrievedAccount.methods).toStrictEqual([]);
      expect(await keyring.listAccounts()).toHaveLength(2);
    });
    it('should throw error for already used address', async () => {
      await expect(
        keyring.createAccount({
          address: '0xE9A74AACd7df8112911ca93260fC5a046f8a64Ae',
        }),
      ).rejects.toThrow(
        'Account address already in use: 0xE9A74AACd7df8112911ca93260fC5a046f8a64Ae',
      );
    });
  });

  describe('updateAccount', () => {
    it('should update an account', async () => {
      const account: KeyringAccount = {
        id,
        address: '0xE9A74AACd7df8112911ca93260fC5a046f8a64Ae',
        options: {},
        methods: [],
        type: 'eip155:eoa',
      };
      const response = await keyring.updateAccount(account);
      expect(response).toBeUndefined();
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
  });

  describe('deleteAccount', () => {
    it('should delete an account', async () => {
      const response = await keyring.deleteAccount(id);
      expect(response).toBeUndefined();
      await expect(keyring.getAccount(id)).rejects.toThrow(
        "Account '49116980-0712-4fa5-b045-e4294f1d440e' not found",
      );
    });
  });

  describe('filterAccountChains', () => {
    it('should filter the chains supported by an account', async () => {
      const expectedResponse = ['eip155:1', 'eip155:137'];
      const account = await keyring.filterAccountChains(
        '49116980-0712-4fa5-b045-e4294f1d440e',
        ['eip155:1', 'eip155:137', 'other:chain'],
      );
      expect(account).toStrictEqual(expectedResponse);
    });
  });

  describe('listRequests', () => {
    it('should be empty', async () => {
      const response = await keyring.listRequests();
      expect(response).toStrictEqual([]);
    });
  });

  describe('getRequest', () => {
    it('should throw an error for a nonexistent request', async () => {
      const requestId = '71621d8d-62a4-4bf4-97cc-fb8f243679b0';
      await expect(keyring.getRequest(requestId)).rejects.toThrow(
        "Request '71621d8d-62a4-4bf4-97cc-fb8f243679b0' not found",
      );
    });
  });

  describe('toggleSyncApprovals', () => {
    it('should toggle sync approvals', async () => {
      await keyring.toggleSyncApprovals();
      expect(keyring.isSynchronousMode()).toBe(true);
    });
  });

  describe('submitRequest', () => {
    beforeEach(async () => {
      await keyring.toggleSyncApprovals();
    });

    it('should throw an error for signing not supported', async () => {
      const personalSignRequest: KeyringRequest = {
        id,
        request: {
          method: 'eth_personalSign',
          params: [{ from: '0x1', to: '0x2', value: '0x0' }],
        },
        scope: '',
        account: '',
      };
      await expect(keyring.submitRequest(personalSignRequest)).rejects.toThrow(
        `Signing is not supported for this watch-only account snap.\nRequest: ${JSON.stringify(
          personalSignRequest,
          null,
          2,
        )}`,
      );

      const signTypedDataV4Request: KeyringRequest = {
        id,
        request: {
          method: 'eth_signTypedData_v4',
          params: [{ from: '0x1', to: '0x2', value: '0x0' }],
        },
        scope: '',
        account: '',
      };
      await expect(
        keyring.submitRequest(signTypedDataV4Request),
      ).rejects.toThrow(
        `Signing is not supported for this watch-only account snap.\nRequest: ${JSON.stringify(
          signTypedDataV4Request,
          null,
          2,
        )}`,
      );
    });
  });

  describe('approveRequest', () => {
    it('should throw an error for signing not supported', async () => {
      await expect(keyring.approveRequest(id)).rejects.toThrow(
        'Signing is not supported in this watch-only account snap.',
      );
    });
  });
});
