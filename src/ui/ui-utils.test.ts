import {
  formatAddress,
  isSmartContractAddress,
  validateUserInput,
} from './ui-utils';
import { TEST_VALUES } from '../test/setup';

// @ts-expect-error Mocking ethereum global object
global.ethereum = {
  request: jest.fn(),
};

describe('UI Utils', () => {
  describe('isSmartContract', () => {
    it('should return true if the address has non-zero bytecode', async () => {
      const result = await isSmartContractAddress(
        TEST_VALUES.smartContractAddress,
      );
      expect(result).toBe(true);
    });

    it('should return false if the address has zero bytecode', async () => {
      const result = await isSmartContractAddress(TEST_VALUES.validAddress);
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
        const result = await validateUserInput(TEST_VALUES.validAddress);
        expect(result).toStrictEqual({
          message: 'Valid address',
          address: TEST_VALUES.validAddress,
        });
      });

      it('should return valid ENS name and message', async () => {
        const result = await validateUserInput(TEST_VALUES.validEnsAddress);
        expect(result).toStrictEqual({
          message: `**${TEST_VALUES.validEns}**`,
          address: TEST_VALUES.validEnsAddress,
        });
      });

      it("should return 'Smart contract' message", async () => {
        const result = await validateUserInput(
          TEST_VALUES.smartContractAddress,
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
        const result = await validateUserInput(TEST_VALUES.validEns);
        expect(result).toStrictEqual({
          message: formatAddress(TEST_VALUES.validEnsAddress),
          address: TEST_VALUES.validEnsAddress,
        });
      });

      it('should return invalid ENS name message', async () => {
        const result = await validateUserInput('nonexistent.eth');
        expect(result).toStrictEqual({
          message: 'Invalid ENS name',
        });
      });

      // TODO: Fix this test
      it('should return ENS is only supported on Ethereum mainnet message', async () => {
        jest.mock('./ui-utils', () => {
          return {
            isMainnet: jest.fn().mockResolvedValueOnce(false),
          };
        });
        const result = await validateUserInput(TEST_VALUES.validEns);
        expect(result).toStrictEqual({
          message: 'ENS is only supported on Ethereum mainnet',
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
