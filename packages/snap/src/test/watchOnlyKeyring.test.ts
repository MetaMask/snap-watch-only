import { WatchOnlyKeyring } from '../keyring';

describe('SimpleKeyring', () => {
  let keyring: WatchOnlyKeyring;

  beforeEach(() => {
    keyring = new WatchOnlyKeyring({
      wallets: {
        '0x1': {
          account: {
            id: '0x1',
            address: '0x1',
            type: 'eip155:eoa',
            options: {},
            methods: [],
          },
          privateKey: '0x1',
        },
      },
      pendingRequests: {},
      useSyncApprovals: false,
    });
  });

  it('should not allow the user to sign transactions', async () => {
    const result = await keyring.submitRequest({
      id: '0x1',
      request: {
        method: 'eth_signTransaction',
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
