// eslint-disable-next-line import/unambiguous
jest.mock('ethers', () => {
  const BrowserProvider = jest.fn().mockImplementation((_ethereum) => ({
    getCode: jest.fn().mockImplementation(async (address) => {
      console.log('inside mock getCode');
      return Promise.resolve(
        address === '0x0227628f3F023bb0B980b67D528571c95c6DaC1c'
          ? '0x123'
          : '0x',
      );
    }),
    resolveName: jest
      .fn()
      .mockResolvedValue('0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb'),
    lookupAddress: jest.fn().mockResolvedValue('metamask.eth'),
  }));

  return {
    ethers: {
      BrowserProvider,
    },
  };
});
