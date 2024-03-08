import { isValidAddress } from '@ethereumjs/util';
import type { Hex } from '@metamask/utils';
import { isValidHexAddress, remove0x } from '@metamask/utils';
import { ethers } from 'ethers';

import { logger, lookupName, resolveName } from '../util';

/**
 * The function signatures for the different types of transactions. This is used
 * to determine the type of transaction. This list is not exhaustive, and only
 * contains the most common types of transactions for demonstration purposes.
 */
const FUNCTION_SIGNATURES = [
  {
    name: 'ERC-20',
    signature: 'a9059cbb',
  },
  {
    name: 'ERC-721',
    signature: '23b872dd',
  },
  {
    name: 'ERC-1155',
    signature: 'f242432a',
  },
];

/**
 * Decode the transaction data. This checks the signature of the function that
 * is being called, and returns the type of transaction.
 *
 * @param data - The transaction data.
 * @returns The type of transaction, or "Unknown," if the function signature
 * does not match any known signatures.
 */
export function decodeData(data?: string) {
  if (data && typeof data === 'string') {
    const normalisedData = remove0x(data);
    const signature = normalisedData.slice(0, 8);

    const functionSignature = FUNCTION_SIGNATURES.find(
      (value) => value.signature === signature,
    );

    return functionSignature?.name ?? 'Unknown';
  }

  return 'Unknown';
}

/**
 * Validate user input as either an Ethereum address or an ENS name and resolve accordingly.
 *
 * @param input - The user input string.
 * @returns A promise that resolves to a validation message with specific address formatting.
 */
export async function validateUserInput(input: string): Promise<string> {
  // Ethereum Address Validation and Lookup
  if (input.startsWith('0x')) {
    if (isValidHexAddress(input as Hex) || isValidAddress(input)) {
      // Smart Contract Address Check
      if (await isSmartContractAddress(input)) {
        return 'Smart contract addresses are not supported yet';
      }
      // ENS Name Lookup
      const ensName = await lookupName(input);
      if (ensName) {
        return `**{ensName}**`;
      }
      // Valid Address
      return `Valid address`;
    }
    return 'Invalid address';
  }
  // ENS Name Resolution
  else if (input.endsWith('.eth')) {
    const address = await resolveName(input);
    if (address) {
      return formatAddress(address);
    }
    return 'Invalid ENS name';
  }
  // Default case for invalid input
  return 'Invalid input';
}

/**
 * Formats an Ethereum address by bolding the first and last segments.
 *
 * @param address - The Ethereum address to format.
 * @returns The formatted Ethereum address.
 */
function formatAddress(address: string): string {
  // Remove the 0x prefix for processing
  const rawAddress = address.slice(2);
  // Split the address into segments
  const segments = rawAddress.match(/.{1,4}/gu);
  if (!segments) {
    return 'Invalid address';
  }
  // Bold the first and last segment
  segments[0] = `${segments[0] as string}**`;
  segments[segments.length - 1] = `**${
    segments[segments.length - 1] as string
  }**`;

  // Reassemble the address with spaces and the 0x prefix
  return `**0x${segments.join(' ')}`;
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
