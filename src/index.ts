import { handleKeyringRequest } from '@metamask/keyring-api';
import { UserInputEventType } from '@metamask/snaps-sdk';
import type {
  OnHomePageHandler,
  OnUserInputHandler,
  OnKeyringRequestHandler,
} from '@metamask/snaps-sdk';

import { WatchOnlyKeyring } from './keyring';
import { originPermissions } from './permissions';
import { getState } from './stateManagement';
import { WatchFormNames } from './ui/components/WatchForm';
import { createInterface, showErrorMessage } from './ui/ui';
import { isMainnet, validateUserInput } from './ui/ui-utils';

let keyring: WatchOnlyKeyring;

/**
 * Return the keyring instance. If it doesn't exist, create it.
 */
export async function getKeyring(): Promise<WatchOnlyKeyring> {
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
  return (await handleKeyringRequest(await getKeyring(), request)) ?? null;
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
    const inputValue = event.value[WatchFormNames.AddressInput]?.toString();

    if (!inputValue) {
      const onMainnet = await isMainnet();
      const emptyInputMessage = onMainnet
        ? 'Address or ENS is required'
        : 'Address is required';
      await showErrorMessage(id, emptyInputMessage);
      return;
    }

    const validation = await validateUserInput(inputValue);

    if (validation.address) {
      const { accountNameSuggestion } = validation;
      try {
        const createAccountOptions: {
          address: string;
          accountNameSuggestion?: string;
        } = {
          address: validation.address,
        };
        if (accountNameSuggestion) {
          createAccountOptions.accountNameSuggestion = accountNameSuggestion;
        }

        await (await getKeyring()).createAccount({ ...createAccountOptions });
      } catch (error) {
        await showErrorMessage(id, (error as Error).message);
      }
    } else {
      // Show error message from validation
      await showErrorMessage(id, validation.message);
    }
  }
};
