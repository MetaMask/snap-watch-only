import { ethers } from 'ethers';

import { logger } from './logger';

/**
 * Resolve ENS name to Ethereum address.
 *
 * @param name - ENS name to resolve.
 * @returns Ethereum address.
 */
export const resolveName = async (name: string): Promise<string | null> => {
  const provider = new ethers.BrowserProvider(ethereum);
  try {
    return await provider.resolveName(name);
  } catch (error) {
    logger.error('Failed to resolve ENS name:', error);
    return null;
  }
};

/**
 * Lookup ENS name.
 *
 * @param address - Ethereum address to lookup.
 * @returns ENS name or `null` if not found.
 */
export const lookupName = async (address: string): Promise<string | null> => {
  const provider = new ethers.BrowserProvider(ethereum);
  try {
    return await provider.lookupAddress(address);
  } catch (error) {
    logger.error('Failed to lookup ENS name:', error);
    return null;
  }
};
