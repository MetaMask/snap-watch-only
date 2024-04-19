export const TEST_VALUES = {
  validAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  validEnsAddress: '0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb',
  validEns: 'metamask.eth',
  smartContractAddress: '0x0227628f3F023bb0B980b67D528571c95c6DaC1c',
};

// eslint-disable-next-line import/unambiguous
jest.mock('ethers', () => {
  const BrowserProvider = jest.fn().mockImplementation((_ethereum) => ({
    getNetwork: jest.fn().mockImplementation(async () => {
      return Promise.resolve({ chainId: 1 });
    }),
    getCode: jest.fn().mockImplementation(async (address) => {
      return Promise.resolve(
        address === TEST_VALUES.smartContractAddress ? '0x123' : '0x',
      );
    }),
    resolveName: jest.fn().mockImplementation(async (name) => {
      return Promise.resolve(
        name === TEST_VALUES.validEns ? TEST_VALUES.validEnsAddress : null,
      );
    }),
    lookupAddress: jest.fn().mockImplementation(async (address) => {
      return Promise.resolve(
        address === TEST_VALUES.validEnsAddress ? TEST_VALUES.validEns : null,
      );
    }),
  }));

  return {
    ethers: {
      BrowserProvider,
    },
  };
});
