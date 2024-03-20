import { describe, jest } from '@jest/globals';

import { isSmartContractAddress } from './ui-utils';

jest.mock('../util/ens', () => ({
  lookupName: jest.fn(),
  resolveName: jest.fn(),
}));

describe.only('UI Utils', () => {
  describe('isSmartContract', () => {
    it('should return true if the address has non-zero bytecode', async () => {
      jest.mock('ethers', () => ({
        ...jest.requireActual('ethers'),
        ethers: {
          BrowserProvider: jest.fn().mockImplementation(() => ({
            getCode: '0x123',
          })),
        },
      }));
      const result = await isSmartContractAddress(
        '0x0227628f3F023bb0B980b67D528571c95c6DaC1c',
      );
      expect(result).toBe(true);
    });

    it('should return false if the address has zero bytecode', async () => {
      jest.mock('ethers', () => ({
        ethers: {
          BrowserProvider: jest.fn().mockImplementation(() => ({
            getCode: '0x',
          })),
        },
      }));
      const result = await isSmartContractAddress(
        '0x225f137127d9067788314bc7fcc1f36746a3c3B5',
      );
      expect(result).toBe(false);
    });
  });

  describe('formatAddress', () => {});

  describe('validateUserInput', () => {});
});
