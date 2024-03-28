import { handleKeyringRequest } from '@metamask/keyring-api';
import type {
  OnHomePageHandler,
  OnUserInputHandler,
} from '@metamask/snaps-sdk';
import { UserInputEventType } from '@metamask/snaps-sdk';
import type { OnKeyringRequestHandler } from '@metamask/snaps-types';

import { WatchOnlyKeyring } from './keyring';
import { originPermissions } from './permissions';
import { getState } from './stateManagement';
import { WatchFormNames } from './ui/components';
import { createInterface, showErrorMessage, showSuccess } from './ui/ui';
import { validateUserInput } from './ui/ui-utils';

let keyring: WatchOnlyKeyring;

/**
 * Return the keyring instance. If it doesn't exist, create it.
 */
async function getKeyring(): Promise<WatchOnlyKeyring> {
  if (!keyring) {
    const state = await getState();
    if (!keyring) {
      keyring = new WatchOnlyKeyring(state);
    }
  }
  return keyring;
}

/**
 * Verify if the caller can call the requested method.
 *
 * @param origin - Caller origin.
 * @param method - Method being called.
 * @returns True if the caller is allowed to call the method, false otherwise.
 */
function hasPermission(origin: string, method: string): boolean {
  return originPermissions.get(origin)?.includes(method) ?? false;
}

/**
 * Handle incoming keyring requests from the MetaMask clients for privileged keyring actions.
 *
 * @param params - The request parameters.
 * @param params.origin - The origin of the request.
 * @param params.request - The keyring request object.
 */
export const onKeyringRequest: OnKeyringRequestHandler = async ({
  origin,
  request,
}) => {
  // Check if origin is allowed to call method.
  if (!hasPermission(origin, request.method)) {
    throw new Error(
      `Origin'${origin}' is not allowed to call '${request.method}'`,
    );
  }

  // Handle keyring methods.
  return handleKeyringRequest(await getKeyring(), request);
};

/**
 * Handle incoming home page requests from the MetaMask clients.
 * Create a new Snap Interface and return it.
 *
 * @returns A static panel rendered with custom UI.
 * @see https://docs.metamask.io/snaps/reference/exports/#onhomepage
 */
export const onHomePage: OnHomePageHandler = async () => {
  const interfaceId = await createInterface();

  return { id: interfaceId };
};

/**
 * Handle incoming user events coming from the MetaMask clients open interfaces.
 *
 * @param params - The event parameters.
 * @param params.id - The Snap interface ID where the event was fired.
 * @param params.event - The event object containing the event type, name and value.
 * @see https://docs.metamask.io/snaps/reference/exports/#onuserinput
 */
export const onUserInput: OnUserInputHandler = async ({ id, event }) => {
  // Handle form submission
  if (
    event.type === UserInputEventType.FormSubmitEvent &&
    event.name === WatchFormNames.AddressForm
  ) {
    const inputValue = event.value[WatchFormNames.AddressInput];

    if (!inputValue) {
      await showErrorMessage(id, 'Address or ENS is required');
      return;
    }

    const validation = await validateUserInput(inputValue);

    if (validation.address) {
      // Show success resolution message and add the account to the keyring
      await showSuccess(id, validation.address, validation.message, true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      try {
        await (
          await getKeyring()
        ).createAccount({ address: validation.address });
      } catch (error) {
        await showErrorMessage(id, (error as Error).message);
      }
    } else {
      // Show error message from validation
      await showErrorMessage(id, validation.message);
    }
  }
};
export { getEnsFromAddress } from './ui/ui-utils';
export { getAddressFromEns } from './ui/ui-utils';
