import { jest } from '@jest/globals';
import type { KeyringAccount, KeyringRequest } from '@metamask/keyring-api';
import { EthAccountType } from '@metamask/keyring-api';
import { ethers } from 'ethers';

import type { KeyringState } from './keyring';
import { WatchOnlyKeyring } from './keyring';

const mockAddress = '0xE9A74AACd7df8112911ca93260fC5a046f8a64Ae';

// @ts-expect-error Mocking Snap global object
global.snap = {
  request: jest.fn(),
  emitEvent: jest.fn(),
};

describe('WatchOnlyKeyring', () => {
  let state: KeyringState, keyring: WatchOnlyKeyring;

  beforeEach(() => {
    state = {
      wallets: {},
      pendingRequests: {},
      useSyncApprovals: false,
    };
    keyring = new WatchOnlyKeyring(state);
  });

  describe('constructor', () => {
    it('should initialize with provided state', async () => {
      expect(await keyring.listAccounts()).toStrictEqual([]);
      expect(await keyring.listRequests()).toStrictEqual([]);
      expect(keyring.isSynchronousMode()).toBe(false);
    });
  });

  describe('createAccount', () => {
    it.each([
      [{}, 'empty object'],
      [{ foo: 'bar' }, 'object with unrelated property'],
      [{ addr: mockAddress }, 'object with addr property (incorrect key)'],
      [{ addres: mockAddress }, 'object with addres property (typo in key)'],
    ])(
      'should throw an error if no public address is provided ($1)',
      async (options, _description) => {
        await expect(keyring.createAccount(options)).rejects.toThrow(
          'Account creation options must include an address',
        );
      },
    );

    it.each([
      [{ address: '123' }, 'invalid hex and non-hex address'],
      [{ address: '0xabc' }, 'invalid hex address, too short'],
      [{ address: '0xz89a...bc' }, 'invalid hex address, bad characters'],
      [{ address: 'xyz123' }, 'invalid non-hex address'],
    ])(
      'should throw an error for an invalid address ($1)',
      async (options, _description) => {
        await expect(keyring.createAccount(options)).rejects.toThrow(
          `Invalid address: ${options.address}`,
        );
      },
    );

    it('should create a watch-only account from a public address', async () => {
      const newAccount = await keyring.createAccount({
        address: mockAddress,
      });
      expect(newAccount.address).toBe(mockAddress);
      expect(newAccount.options).toStrictEqual({});
      expect(newAccount.methods).toStrictEqual([]);
      expect(newAccount.type).toBe(EthAccountType.Eoa);
    });
    it('should throw error for account address already in use', async () => {
      const newAccount = await keyring.createAccount({
        address: mockAddress,
      });
      await expect(
        keyring.createAccount({
          address: newAccount.address,
        }),
      ).rejects.toThrow(
        `Account address already in use: ${newAccount.address}`,
      );
    });
  });

  describe('getAccount', () => {
    it('should get an account by ID', async () => {
      const account = await keyring.createAccount({
        address: mockAddress,
      });
      const expectedResponse = {
        id: account.id,
        address: mockAddress,
        options: {},
        methods: [],
        type: EthAccountType.Eoa,
      };
      expect(await keyring.getAccount(account.id)).toStrictEqual(
        expectedResponse,
      );
    });
    it('should throw error for nonexistent account', async () => {
      await expect(keyring.getAccount('nonexistent')).rejects.toThrow(
        "Account 'nonexistent' not found",
      );
    });
  });

  describe('listAccounts', () => {
    it('should list accounts', async () => {
      const account1 = await keyring.createAccount({
        address: mockAddress,
      });
      const account2 = await keyring.createAccount({
        address: ethers.Wallet.createRandom().address,
      });
      const account3 = await keyring.createAccount({
        address: ethers.Wallet.createRandom().address,
      });
      const expectedResponse = [account1, account2, account3];
      expect(await keyring.listAccounts()).toStrictEqual(expectedResponse);
    });
  });

  // describe('updateAccount', () => {
  //   it('should update an account', async () => {
  //     const account: KeyringAccount = {
  //       id: mockAccountId,
  //       address: '0xE9A74AACd7df8112911ca93260fC5a046f8a64Ae',
  //       options: {},
  //       methods: [],
  //       type: 'eip155:eoa',
  //     };
  //     const response = await keyring.updateAccount(account);
  //     expect(response).toBeUndefined();
  //   });
  //   it('should throw error when updating a nonexistent account', async () => {
  //     const nonexistentAccount: KeyringAccount = {
  //       type: 'eip155:eoa',
  //       id: 'nonexistent',
  //       address: '0x1N0N3X1ST3NT',
  //       options: {},
  //       methods: ['personal_sign', 'eth_sign'],
  //     };
  //     await expect(keyring.updateAccount(nonexistentAccount)).rejects.toThrow(
  //       "Account 'nonexistent' not found",
  //     );
  //   });
  // });
  //
  // describe('deleteAccount', () => {
  //   it('should delete an account', async () => {
  //     const response = await keyring.deleteAccount(mockAccountId);
  //     expect(response).toBeUndefined();
  //     await expect(keyring.getAccount(mockAccountId)).rejects.toThrow(
  //       "Account '49116980-0712-4fa5-b045-e4294f1d440e' not found",
  //     );
  //   });
  // });
  //
  // describe('filterAccountChains', () => {
  //   it('should filter the chains supported by an account', async () => {
  //     const expectedResponse = ['eip155:1', 'eip155:137'];
  //     const account = await keyring.filterAccountChains(
  //       '49116980-0712-4fa5-b045-e4294f1d440e',
  //       ['eip155:1', 'eip155:137', 'other:chain'],
  //     );
  //     expect(account).toStrictEqual(expectedResponse);
  //   });
  // });
  //
  // describe('listRequests', () => {
  //   it('should be empty', async () => {
  //     const response = await keyring.listRequests();
  //     expect(response).toStrictEqual([]);
  //   });
  // });
  //
  // describe('getRequest', () => {
  //   it('should throw an error for a nonexistent request', async () => {
  //     const requestId = '71621d8d-62a4-4bf4-97cc-fb8f243679b0';
  //     await expect(keyring.getRequest(requestId)).rejects.toThrow(
  //       "Request '71621d8d-62a4-4bf4-97cc-fb8f243679b0' not found",
  //     );
  //   });
  // });
  //
  // describe('toggleSyncApprovals', () => {
  //   it('should toggle sync approvals', async () => {
  //     await keyring.toggleSyncApprovals();
  //     expect(keyring.isSynchronousMode()).toBe(true);
  //   });
  // });
  //
  // describe('submitRequest', () => {
  //   beforeEach(async () => {
  //     await keyring.toggleSyncApprovals();
  //   });
  //
  //   it('should throw an error for signing not supported', async () => {
  //     const personalSignRequest: KeyringRequest = {
  //       id: mockAccountId,
  //       request: {
  //         method: 'eth_personalSign',
  //         params: [{ from: '0x1', to: '0x2', value: '0x0' }],
  //       },
  //       scope: '',
  //       account: '',
  //     };
  //     await expect(keyring.submitRequest(personalSignRequest)).rejects.toThrow(
  //       `Signing is not supported for this watch-only account snap.\nRequest: ${JSON.stringify(
  //         personalSignRequest,
  //         null,
  //         2,
  //       )}`,
  //     );
  //
  //     const signTypedDataV4Request: KeyringRequest = {
  //       id: mockAccountId,
  //       request: {
  //         method: 'eth_signTypedData_v4',
  //         params: [{ from: '0x1', to: '0x2', value: '0x0' }],
  //       },
  //       scope: '',
  //       account: '',
  //     };
  //     await expect(
  //       keyring.submitRequest(signTypedDataV4Request),
  //     ).rejects.toThrow(
  //       `Signing is not supported for this watch-only account snap.\nRequest: ${JSON.stringify(
  //         signTypedDataV4Request,
  //         null,
  //         2,
  //       )}`,
  //     );
  //   });
  // });
  //
  // describe('approveRequest', () => {
  //   it('should throw an error for signing not supported', async () => {
  //     await expect(keyring.approveRequest(mockAccountId)).rejects.toThrow(
  //       'Signing is not supported in this watch-only account snap.',
  //     );
  //   });
  // });
});
