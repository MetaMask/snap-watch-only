import { describe, jest } from '@jest/globals';
import type { ethers } from 'ethers';

import {
  formatAddress,
  isSmartContractAddress,
  validateUserInput,
} from './ui-utils';

// @ts-expect-error Mocking ethereum global object
global.ethereum = {
  request: jest.fn(),
};

// Mock the ethers library
jest.mock('ethers', () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const actualEthers = jest.requireActual('ethers') as typeof ethers;
  return {
    ...actualEthers,
    BrowserProvider: {
      getCode: jest
        .fn<(address: string) => Promise<string>>()
        .mockImplementation(async (address) => {
          console.log('inside mock getCode');
          return address === '0x0227628f3F023bb0B980b67D528571c95c6DaC1c'
            ? '0x123'
            : '0x';
        }),
      resolveName: jest
        .fn<() => Promise<string>>()
        .mockResolvedValue('0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb'),
      lookupAddress: jest
        .fn<() => Promise<string>>()
        .mockResolvedValue('metamask.eth'),
    },
  };
});

describe('UI Utils', () => {
  describe('isSmartContract', () => {
    it('should return true if the address has non-zero bytecode', async () => {
      const result = await isSmartContractAddress(
        '0x0227628f3F023bb0B980b67D528571c95c6DaC1c',
      );
      expect(result).toBe(true);
    });

    it('should return false if the address has zero bytecode', async () => {
      const result = await isSmartContractAddress(
        '0x225f137127d9067788314bc7fcc1f36746a3c3B5',
      );
      expect(result).toBe(false);
    });
  });

  describe('formatAddress', () => {
    it.each([
      [
        '0x1234567890abcdef1234567890abcdef12345678',
        '**0x1234** 5678 90ab cdef 1234 5678 90ab cdef 1234 **5678**',
      ],
      [
        '0xabcdef1234567890abcdef1234567890abcdef12',
        '**0xabcd** ef12 3456 7890 abcd ef12 3456 7890 abcd **ef12**',
      ],
      ['0x12345', 'Invalid address'],
      ['0xzxyxzyxzyxzyxzyxzyxzyxzyxzyxzyxzyxzyxzyxz', 'Invalid address'],
      ['0x123456789abcdef', 'Invalid address'],
    ])('formats input %s correctly', (input, expected) => {
      expect(formatAddress(input)).toBe(expected);
    });
  });

  describe('validateUserInput', () => {
    describe("when input starts with '0x'", () => {
      it('should return a valid address and message', async () => {
        const result = await validateUserInput(
          '0x0227628f3F023bb0B980b67D528571c95c6DaC1c',
        );
        expect(result).toStrictEqual({
          message: 'Valid address',
          address: '0x0227628f3F023bb0B980b67D528571c95c6DaC1c',
        });
      });

      it('should return valid ENS name and message', async () => {
        const result = await validateUserInput(
          '0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb',
        );
        expect(result).toStrictEqual({
          message: '**metamask.eth**',
          address: '0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb',
        });
      });

      it("should return 'Smart contract' message", async () => {
        const result = await validateUserInput(
          '0x0227628f3F023bb0B980b67D528571c95c6DaC1c',
        );
        expect(result).toStrictEqual({
          message: 'Smart contract addresses are not supported yet',
        });
      });

      it('should return invalid address message', async () => {
        const result = await validateUserInput('0x12345');
        expect(result).toStrictEqual({
          message: 'Invalid address',
        });
      });
    });

    describe("when input ends with '.eth'", () => {
      it('should return valid ENS name and message', async () => {
        const result = await validateUserInput('metamask.eth');
        expect(result).toStrictEqual({
          message: formatAddress('0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb'),
          address: '0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb',
        });
      });

      it('should return invalid ENS name message', async () => {
        const result = await validateUserInput('nonexistent.eth');
        expect(result).toStrictEqual({
          message: 'Invalid ENS name',
        });
      });
    });

    describe('when input is invalid', () => {
      it.each([
        ['12345', 'Invalid input'],
        ['abc', 'Invalid input'],
        ['zxyxzyxzyxzyxzyxzyxzyxzyxzyxzyxzyxzyxzyxz', 'Invalid input'],
        ['0227628f3F023bb0B980b67D528571c95c6DaC1c', 'Invalid input'],
        ['metamask', 'Invalid input'],
      ])('should return %s message', async (input, expected) => {
        const result = await validateUserInput(input);
        expect(result).toStrictEqual({
          message: expected,
        });
      });
    });
  });
});
