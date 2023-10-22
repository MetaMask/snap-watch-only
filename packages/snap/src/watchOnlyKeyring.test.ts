import { expect } from '@jest/globals';
import type {
  KeyringAccount,
  KeyringRequest,
  KeyringResponse,
} from '@metamask/keyring-api';

import type { KeyringState } from './keyring';
import { WatchOnlyKeyring } from './keyring';

describe('WatchOnlyKeyring', () => {
  const mockSender = {
    send: jest.fn(),
  };

  const accountId = '49116980-0712-4fa5-b045-e4294f1d440e';
  const state: KeyringState = {
    wallets: {
      [accountId]: {
        account: {
          id: accountId,
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
  const keyring = new WatchOnlyKeyring(state);

  beforeEach(() => {
    mockSender.send.mockClear();
  });

  describe('constructor', () => {
    it('should initialize with provided state', async () => {
      expect(await keyring.getAccount(accountId)).toStrictEqual(
        state.wallets[accountId]?.account,
      );
      expect(await keyring.listRequests()).toStrictEqual([]);
      expect(keyring.isSynchronousMode()).toBe(false);
    });
  });

  describe('getAccount', () => {
    it('should get an account by ID', async () => {
      const id = '49116980-0712-4fa5-b045-e4294f1d440e';
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
    it.only('should create a new account without options', async () => {
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
      const publicAddress = '0xPUBLIC';
      const newAccount = await keyring.createAccount({
        address: publicAddress,
      });
      expect(newAccount.address).toBe(publicAddress);
      const retrievedAccount = await keyring.getAccount(publicAddress);
      expect(retrievedAccount).toStrictEqual(newAccount);
    });
    it('should throw error for already used address', async () => {
      await expect(
        keyring.createAccount({
          address: '0xE9A74AACd7df8112911ca93260fC5a046f8a64Ae',
        }),
      ).rejects.toThrow('Account address already in use: 0x1');
    });
  });

  describe('updateAccount', () => {
    it('should update an account', async () => {
      const account: KeyringAccount = {
        id: '49116980-0712-4fa5-b045-e4294f1d440e',
        address: '0xE9A74AACd7df8112911ca93260fC5a046f8a64Ae',
        options: { updated: true },
        methods: [],
        type: 'eip155:eoa',
      };
      const response = await keyring.updateAccount(account);
      expect(response).toBeUndefined();
      const updatedAccount = await keyring.getAccount(account.id);
      expect(updatedAccount.options).toStrictEqual({
        ...account?.options,
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
  });

  describe('deleteAccount', () => {
    it('should delete an account', async () => {
      const id = '49116980-0712-4fa5-b045-e4294f1d440e';
      const response = await keyring.deleteAccount(id);
      expect(response).toBeUndefined();
      await expect(await keyring.getAccount(id)).rejects.toThrow(
        "Account '49116980-0712-4fa5-b045-e4294f1d440e' not found",
      );
    });
    it('should throw error when deleting a nonexistent account', async () => {
      await expect(keyring.deleteAccount('nonexistent')).rejects.toThrow(
        "Request 'nonexistent' not found",
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
      const expectedResponse: KeyringRequest[] = [
        {
          id: '71621d8d-62a4-4bf4-97cc-fb8f243679b0',
          scope: 'eip155:1',
          account: '46b5ccd3-4786-427c-89d2-cef626dffe9b',
          request: {
            method: 'personal_sign',
            params: ['0xe9a74aacd7df8112911ca93260fc5a046f8a64ae', '0x0'],
          },
        },
      ];

      mockSender.send.mockResolvedValue(expectedResponse);
      const response = await keyring.listRequests();
      expect(mockSender.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        id: expect.any(String),
        method: 'keyring_listRequests',
      });
      expect(response).toStrictEqual(expectedResponse);
    });
  });

  describe('getRequest', () => {
    it('should throw an error for a nonexistent request', async () => {
      const id = '71621d8d-62a4-4bf4-97cc-fb8f243679b0';
      const expectedResponse: KeyringRequest = {
        id,
        scope: 'eip155:1',
        account: '46b5ccd3-4786-427c-89d2-cef626dffe9b',
        request: {
          method: 'personal_sign',
          params: ['0xe9a74aacd7df8112911ca93260fc5a046f8a64ae', '0x0'],
        },
      };

      mockSender.send.mockResolvedValue(expectedResponse);
      const response = await keyring.getRequest(id);
      expect(mockSender.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        id: expect.any(String),
        method: 'keyring_getRequest',
        params: { id },
      });
      expect(response).toStrictEqual(expectedResponse);
    });
  });

  describe('submitRequest', () => {
    it('should throw an error for signing not supported', async () => {
      const request: KeyringRequest = {
        id: '71621d8d-62a4-4bf4-97cc-fb8f243679b0',
        scope: 'eip155:1',
        account: '46b5ccd3-4786-427c-89d2-cef626dffe9b',
        request: {
          method: 'personal_sign',
          params: ['0xe9a74aacd7df8112911ca93260fc5a046f8a64ae', '0x0'],
        },
      };
      const expectedResponse: KeyringResponse = {
        pending: true,
        redirect: {
          message: 'Please continue to the dapp',
          url: 'https://example.com',
        },
      };

      mockSender.send.mockResolvedValue(expectedResponse);
      const response = await keyring.submitRequest(request);
      expect(mockSender.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        id: expect.any(String),
        method: 'keyring_submitRequest',
        params: request,
      });
      expect(response).toStrictEqual(expectedResponse);
    });
  });

  describe('approveRequest', () => {
    it('should throw an error for signing not supported', async () => {
      const id = '71621d8d-62a4-4bf4-97cc-fb8f243679b0';

      mockSender.send.mockResolvedValue(null);
      const response = await keyring.approveRequest(id);
      expect(mockSender.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        id: expect.any(String),
        method: 'keyring_approveRequest',
        params: { id, data: {} },
      });
      expect(response).toBeUndefined();
    });
  });

  describe('rejectRequest', () => {
    it('should remove a pending request', async () => {
      const id = '71621d8d-62a4-4bf4-97cc-fb8f243679b0';

      mockSender.send.mockResolvedValue(null);
      const response = await keyring.rejectRequest(id);
      expect(mockSender.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        id: expect.any(String),
        method: 'keyring_rejectRequest',
        params: { id },
      });
      expect(response).toBeUndefined();
    });
  });

  describe('toggleSyncApprovals', () => {
    it('should toggle sync approvals', async () => {
      await keyring.toggleSyncApprovals();
      expect(keyring.isSynchronousMode()).toBe(true);
    });
  });
});
