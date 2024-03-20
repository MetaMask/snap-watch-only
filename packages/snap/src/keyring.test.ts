import {
  type KeyringAccount,
  type KeyringRequest,
} from '@metamask/keyring-api';
import * as uuid from 'uuid';

import type { KeyringState } from './keyring';
import { WatchOnlyKeyring } from './keyring';
import * as stateManagement from './stateManagement';

const id = 'ea747116-767c-4117-a347-0c3f7b19cc5a';
const mockAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const mockSnapRequest = jest.fn();

jest.mock('uuid');
const mockUuid = jest.spyOn(uuid, 'v4');
// @ts-expect-error Mocking Snap global object
global.snap = {
  request: () => mockSnapRequest,
  emitEvent: jest.fn().mockResolvedValue(null),
};

describe('WatchOnlyKeyring', () => {
  let state: KeyringState, keyring: WatchOnlyKeyring;

  beforeEach(() => {
    mockUuid.mockReturnValue(id);
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
    };
    keyring = new WatchOnlyKeyring(state);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with provided state', async () => {
      expect(await keyring.getAccount(id)).toStrictEqual(
        state.wallets[id]?.account,
      );
    });
  });

  describe('getAccount', () => {
    it('should get an account by ID', async () => {
      const expectedResponse = {
        id: expect.any(String),
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
          id: expect.any(String),
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
      mockUuid.mockReturnValue('new-account-id');
      const expectedAccount = {
        id: 'new-account-id',
        address: expect.any(String),
        options: {},
        methods: [],
        type: 'eip155:eoa',
      };
      const newAccount = await keyring.createAccount({
        address: mockAddress,
      });
      expect(newAccount).toStrictEqual(expectedAccount);
    });

    it.each([
      [{}, 'empty object'],
      [{ foo: 'bar' }, 'object with unrelated property'],
      [{ addr: mockAddress }, 'object with addr property (incorrect key)'],
      [{ addres: mockAddress }, 'object with addres property (typo in key)'],
    ])(
      'should throw an error if no public address was provided ($1)',
      async (options, _description) => {
        // @ts-expect-error Testing invalid options
        await expect(keyring.createAccount(options)).rejects.toThrow(
          'Account creation options must include an address',
        );
      },
    );

    it('should throw create account error', async () => {
      const expectedError = new Error('Snap error');
      jest.spyOn(stateManagement, 'saveState').mockRejectedValue(expectedError);
      await expect(
        keyring.createAccount({
          address: mockAddress,
        }),
      ).rejects.toThrow('Unknown snap error: Snap error');
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
      await keyring.updateAccount(account);

      const updatedAccount = await keyring.getAccount(id);
      expect(updatedAccount).toStrictEqual(account);
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
    });

    it('should throw if account is not found', async () => {
      await expect(keyring.deleteAccount('unknown-id')).rejects.toThrow(
        "Account 'unknown-id' not found",
      );
    });

    it('handles errors', async () => {
      const expectedError = new Error('Snap error');
      jest.spyOn(stateManagement, 'saveState').mockRejectedValue(expectedError);
      await expect(keyring.deleteAccount(id)).rejects.toThrow(
        'Unknown snap error: Snap error',
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

  describe('submitRequest', () => {
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
});
