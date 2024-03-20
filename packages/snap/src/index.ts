import { handleKeyringRequest } from '@metamask/keyring-api';
import type {
  OnHomePageHandler,
  OnUserInputHandler,
} from '@metamask/snaps-sdk';
import { UserInputEventType } from '@metamask/snaps-sdk';
import type {
  OnKeyringRequestHandler,
  OnRpcRequestHandler,
} from '@metamask/snaps-types';

import { WatchOnlyKeyring } from './keyring';
import { originPermissions } from './permissions';
import { getState } from './stateManagement';
import {
  createInterface,
  showErrorMessage,
  showForm,
  showSuccess,
} from './ui/ui';
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
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles two methods:
 *
 * - `dialog`: Create a `snap_dialog` with an interactive interface. This demonstrates
 * that a snap can show an interactive `snap_dialog` that the user can interact with.
 *
 * - `getState`: Get the state of a given interface. This demonstrates
 * that a snap can retrieve an interface state.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @param params.origin - The origin of the request.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  // Check if origin is allowed to call method.
  if (!hasPermission(origin, request.method)) {
    throw new Error(
      `Origin '${origin}' is not allowed to call '${request.method}'`,
    );
  }
};

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
    event.name === 'address-form'
  ) {
    const inputValue = event.value['address-input'];

    if (!inputValue) {
      await showErrorMessage(id, 'Address or ENS is required');
      return;
    }

    const validation = await validateUserInput(inputValue);
    // Show validation message
    await showForm(id, validation.message);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (validation.address) {
      // Add the watch-only account to the keyring
      try {
        await (
          await getKeyring()
        ).createAccount({ address: validation.address });
        await showSuccess(id, validation.address);
      } catch (error) {
        await showErrorMessage(id, (error as Error).message);
      }
    } else {
      // Show error message from validation
      await showErrorMessage(id, validation.message);
    }
  }
};
