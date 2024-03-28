import {
  EthMethod,
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

const saveStateWillThrow = (message: string) => {
  jest.spyOn(stateManagement, 'saveState').mockImplementationOnce(async () => {
    throw new Error(`Unknown snap error: ${message}`);
  });
};
const failedToSaveStateError = 'Failed to save state';

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

    it.each([
      [{ address: '123' }, 'invalid hex and non-hex address'],
      [{ address: 'abc' }, 'invalid hex and non-hex address'],
      [{ address: '0xabc' }, 'invalid hex address, too short'],
      [{ address: '0xz89a...bc' }, 'invalid hex address, bad characters'],
      [
        { address: 'r9dA6BH26964aF9D7eTd9e93E57415D37aA96046' },
        'invalid non-hex address',
      ],
    ])(
      'should throw an error for an invalid address ($1)',
      async (options, _description) => {
        await expect(keyring.createAccount(options)).rejects.toThrow(
          `Invalid address '${options.address}' provided`,
        );
      },
    );

    it('should throw error for already used address', async () => {
      await expect(
        keyring.createAccount({
          address: '0xE9A74AACd7df8112911ca93260fC5a046f8a64Ae',
        }),
      ).rejects.toThrow(
        'Account address already in use: 0xE9A74AACd7df8112911ca93260fC5a046f8a64Ae',
      );
    });

    it('should throw error when saving state fails', async () => {
      saveStateWillThrow(failedToSaveStateError);
      await expect(
        keyring.createAccount({ address: mockAddress }),
      ).rejects.toThrow(`Unknown snap error: ${failedToSaveStateError}`);
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

    it('should not update read-only properties of an account', async () => {
      const accountBefore = await keyring.getAccount(id);
      const account: KeyringAccount = {
        id,
        address: '0xE9A74AACd7df8112911ca93260fC5a046f8a64Ae',
        options: {},
        methods: [...Object.values(EthMethod)],
        type: 'eip155:eoa',
      };
      await keyring.updateAccount(account);
      const updatedAccount = await keyring.getAccount(id);
      expect(updatedAccount).not.toStrictEqual(account);
      expect(updatedAccount).toStrictEqual(accountBefore);
      expect(updatedAccount.methods).toStrictEqual([]);
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

    it('should throw error when saving state fails', async () => {
      saveStateWillThrow(failedToSaveStateError);
      const account: KeyringAccount = {
        id,
        address: '0xE9A74AACd7df8112911ca93260fC5a046f8a64Ae',
        options: {},
        methods: [],
        type: 'eip155:eoa',
      };
      await expect(keyring.updateAccount(account)).rejects.toThrow(
        `Unknown snap error: ${failedToSaveStateError}`,
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

    it('should throw an error if save state fails', async () => {
      saveStateWillThrow(failedToSaveStateError);
      await expect(keyring.deleteAccount(id)).rejects.toThrow(
        `Unknown snap error: ${failedToSaveStateError}`,
      );
    });
  });

  describe('filterAccountChains', () => {
    it('should filter the chains supported by an account', async () => {
      const expectedResponse = ['eip155:1', 'eip155:137'];
      const account = await keyring.filterAccountChains(
        '49116980-0712-4fa5-b045-e4294f1d440e',
        ['non-evm:200', 'eip155:1', 'eip155:137', 'other:chain', 'solana:101'],
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
