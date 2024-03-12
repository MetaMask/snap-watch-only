import {
  handleKeyringRequest,
  MethodNotSupportedError,
} from '@metamask/keyring-api';
import type {
  OnHomePageHandler,
  OnUserInputHandler,
} from '@metamask/snaps-sdk';
import {
  assert,
  ManageStateOperation,
  UserInputEventType,
} from '@metamask/snaps-sdk';
import type {
  OnKeyringRequestHandler,
  OnRpcRequestHandler,
} from '@metamask/snaps-types';

import { WatchOnlyKeyring } from './keyring';
import { InternalMethod, originPermissions } from './permissions';
import { getState } from './stateManagement';
import {
  createInterface,
  showErrorMessage,
  showForm,
  showSuccess,
} from './ui/ui';
import { validateUserInput } from './ui/ui-utils';
import { resolveName } from './util';

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

  // Handle custom methods.
  switch (request.method) {
    case InternalMethod.ToggleSyncApprovals: {
      return (await getKeyring()).toggleSyncApprovals();
    }

    case InternalMethod.IsSynchronousMode: {
      return (await getKeyring()).isSynchronousMode();
    }

    // Handle UI methods
    case 'dialog': {
      try {
        const interfaceId = await createInterface();

        await snap.request({
          method: 'snap_manageState',
          params: {
            operation: ManageStateOperation.UpdateState,
            newState: { interfaceId },
            encrypted: false,
          },
        });

        return await snap.request({
          method: 'snap_dialog',
          params: {
            type: 'confirmation',
            id: interfaceId,
          },
        });
      } finally {
        await snap.request({
          method: 'snap_manageState',
          params: {
            operation: ManageStateOperation.ClearState,
            encrypted: false,
          },
        });
      }
    }

    case 'getState': {
      const snapState = await snap.request({
        method: 'snap_manageState',
        params: {
          operation: ManageStateOperation.GetState,
          encrypted: false,
        },
      });

      assert(snapState?.interfaceId, 'No interface ID found in state.');

      return await snap.request({
        method: 'snap_getInterfaceState',
        params: {
          id: snapState.interfaceId as string,
        },
      });
    }

    default: {
      throw new MethodNotSupportedError(request.method);
    }
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
  // validate input
  if (
    event.type === UserInputEventType.InputChangeEvent &&
    event.name === 'address-input'
  ) {
    const inputValue = event.value;
    const message = await validateUserInput(inputValue);
    await showForm(id, message);
  }

  // Handle form submission
  if (
    event.type === UserInputEventType.FormSubmitEvent &&
    event.name === 'address-form'
  ) {
    const inputValue = event.value['address-input'];

    if (!inputValue) {
      await showErrorMessage(id, 'Address or ENS is required');
    }
    let address = inputValue as string;
    if (address.endsWith('.eth')) {
      const ensResolution = await resolveName(address);
      if (ensResolution) {
        address = ensResolution;
      } else {
        await showErrorMessage(id, `Could not resolve ENS name: ${address}`);
        return;
      }
    }

    // Add watch only address to keyring.
    try {
      await (await getKeyring()).createAccount({ address });
      await showSuccess(id, address);
    } catch (error) {
      await showErrorMessage(id, (error as Error).message);
    }
  }
};
