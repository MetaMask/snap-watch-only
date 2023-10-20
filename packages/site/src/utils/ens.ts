import { ethers } from 'ethers';

/**
 * Resolve ENS name to Ethereum address.
 *
 * @param name - ENS name to resolve.
 * @returns Ethereum address.
 */
export const resolveName = async (name: string): Promise<string | null> => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  try {
    return await provider.resolveName(name);
  } catch (error) {
    console.error('Failed to resolve ENS name:', error);
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
  const provider = new ethers.BrowserProvider(window.ethereum);
  try {
    return await provider.lookupAddress(address);
  } catch (error) {
    console.error('Failed to lookup ENS name:', error);
    return null;
  }
};
