import { ethers } from 'ethers';

import { logger } from './logger';

/**
 * Get Ethereum address from ENS name.
 *
 * @param name - ENS name to resolve.
 * @returns Ethereum address or `null` if not found.
 */
export const getAddressFromEns = async (
  name: string,
): Promise<string | null> => {
  const provider = new ethers.BrowserProvider(ethereum);
  try {
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
  const provider = new ethers.BrowserProvider(ethereum);
  try {
    return await provider.lookupAddress(address);
  } catch (error) {
    logger.error(`Failed to lookup ENS name for '${address}': `, error);
    return null;
  }
};
