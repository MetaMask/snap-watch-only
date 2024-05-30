import { isValidAddress } from '@ethereumjs/util';
import type { Hex } from '@metamask/utils';
import { add0x, isValidHexAddress, remove0x } from '@metamask/utils';
import { ethers } from 'ethers';

import { getKeyring } from '..';
import { logger } from '../util';

export type ValidationResult = {
  message: string;
  address?: string;
  accountNameSuggestion?: string;
};

/**
 * Checks if the network is Ethereum mainnet.
 *
 * @returns True if the network is Ethereum mainnet, false otherwise.
 */
export async function isMainnet(): Promise<boolean> {
  const provider = new ethers.BrowserProvider(ethereum);
  return Number((await provider.getNetwork()).chainId) === 1;
}

/**
 * Get Ethereum address from ENS name.
 *
 * @param name - ENS name to resolve.
 * @returns Ethereum address or `null` if not found.
 */
export const getAddressFromEns = async (
  name: string,
): Promise<string | null> => {
  try {
    const provider = new ethers.BrowserProvider(ethereum);
    return await provider.resolveName(name);
  } catch (error) {
    logger.error(`Failed to resolve ENS name '${name}': `, error);
    return null;
  }
};

/**
 * Get ENS name from Ethereum address.
 *
 * @param address - Ethereum address to lookup ENS name for.
 * @returns ENS name or `null` if not found.
 */
export const getEnsFromAddress = async (
  address: string,
): Promise<string | null> => {
  try {
    const provider = new ethers.BrowserProvider(ethereum);
    return await provider.lookupAddress(address);
  } catch (error) {
    logger.error(`Failed to lookup ENS name for '${address}': `, error);
    return null;
  }
};

/**
 * Get the next account number from the keyring.
 *
 * @returns The next account number.
 */
export const getNextAccountNumber = async (): Promise<number> => {
  const keyring = await getKeyring();
  const accounts = await keyring.listAccounts();
  return accounts.length + 1;
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
      const ensName = await getEnsFromAddress(input);
      if (ensName) {
        return {
          message: `**${ensName}**`,
          address: input,
          accountNameSuggestion: ensName,
        };
      }
      // Valid Address
      return {
        message: `Valid address`,
        address: input,
        accountNameSuggestion: `Watched Account ${await getNextAccountNumber()}`,
      };
    }
    // Invalid Address
    return { message: 'Invalid address' };
  }
  // ENS Name Resolution
  else if (input.endsWith('.eth')) {
    if (await isMainnet()) {
      const address = await getAddressFromEns(input);
      // Valid ENS Name
      if (address) {
        return {
          message: formatAddress(address),
          address,
          accountNameSuggestion: input,
        };
      }
      // Invalid ENS Name
      return { message: 'Invalid ENS name' };
    }
    // ENS only supported on Ethereum mainnet
    return { message: 'ENS is only supported on Ethereum mainnet' };
  }
  // Default case for invalid input
  return { message: 'Invalid input' };
}

/**
 * Formats an Ethereum address by splitting into 10 segments bolding the first and last segments.
 *
 * @param address - The Ethereum address to format.
 * @returns The formatted Ethereum address.
 */
export function formatAddress(address: string): string {
  if (!isValidHexAddress(address as Hex) || !isValidAddress(address)) {
    return 'Invalid address';
  }
  // Remove the 0x prefix for processing
  const rawAddress = remove0x(address as Hex);
  // Split the address into segments
  const segments = rawAddress.match(/.{1,4}/gu);
  if (!segments || segments.length !== 10) {
    return 'Invalid address';
  }
  // Bold the first and last segment and add the 0x prefix to the first segment
  segments[0] = `**${add0x(segments[0])}**`;
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
export async function isSmartContractAddress(
  address: string,
): Promise<boolean> {
  try {
    const provider = new ethers.BrowserProvider(ethereum);
    const code = await provider.getCode(address);
    return code !== '0x' && code !== '0x0';
  } catch (error) {
    logger.error(`Error checking address code: ${(error as Error).message}`);
    return false;
  }
}
