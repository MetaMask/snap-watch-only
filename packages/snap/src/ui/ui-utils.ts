import { isValidAddress } from '@ethereumjs/util';
import type { Hex } from '@metamask/utils';
import { add0x, isValidHexAddress, remove0x } from '@metamask/utils';
import { ethers } from 'ethers';

import { logger, lookupName, resolveName } from '../util';

export type ValidationResult = {
  message: string;
  address?: string;
};

/**
 * Validate user input as either an Ethereum address or an ENS name and resolve accordingly.
 *
 * @param input - The user input string.
 * @returns A promise that resolves to a validation message with specific address formatting.
 */
export async function validateUserInput(
  input: string,
): Promise<ValidationResult> {
  // Ethereum Address Validation and Lookup
  if (input.startsWith('0x')) {
    if (isValidHexAddress(input as Hex) || isValidAddress(input)) {
      // Smart Contract Address Check
      if (await isSmartContractAddress(input)) {
        return { message: 'Smart contract addresses are not supported yet' };
      }
      // ENS Name Lookup
      const ensName = await lookupName(input);
      if (ensName) {
        return { message: `**${ensName}**`, address: input };
      }
      // Valid Address
      return { message: `Valid address`, address: input };
    }
    // Invalid Address
    return { message: 'Invalid address' };
  }
  // ENS Name Resolution
  else if (input.endsWith('.eth')) {
    const address = await resolveName(input);
    // Valid ENS Name
    if (address) {
      return { message: formatAddress(address), address };
    }
    // Invalid ENS Name
    return { message: 'Invalid ENS name' };
  }
  // Default case for invalid input
  return { message: 'Invalid input' };
}

/**
 * Formats an Ethereum address by bolding the first and last segments.
 *
 * @param address - The Ethereum address to format.
 * @returns The formatted Ethereum address.
 */
function formatAddress(address: string): string {
  // Remove the 0x prefix for processing
  const rawAddress = remove0x(address as Hex);
  // Split the address into segments
  const segments = rawAddress.match(/.{1,4}/gu);
  if (!segments) {
    return 'Invalid address';
  }
  // Bold the first and last segment and add the 0x prefix to the first segment
  segments[0] = `**${add0x(segments[0] as string)}**`;
  segments[segments.length - 1] = `**${
    segments[segments.length - 1] as string
  }**`;
  // Reassemble the address with spaces
  return `${segments.join(' ')}`;
}

/**
 * Checks if an address is a smart contract.
 *
 * @param address - The Ethereum address to check.
 * @returns A promise that resolves to true if the address is a smart contract, false otherwise.
 */
async function isSmartContractAddress(address: string): Promise<boolean> {
  const provider = new ethers.BrowserProvider(ethereum);
  try {
    const code = await provider.getCode(address);
    return code !== '0x' && code !== '0x0';
  } catch (error) {
    logger.error(`Error checking address code: ${(error as Error).message}`);
    return false;
  }
}
