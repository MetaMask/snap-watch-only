import {
  generateErrorMessageComponent,
  generateSpinnerComponent,
  generateSuccessMessageComponent,
  generateWatchFormComponent,
} from './components';
import { isMainnet } from './ui-utils';

/**
 * Initiate a new interface with the starting screen.
 *
 * @returns The Snap interface ID.
 */
export async function createInterface(): Promise<string> {
  const onMainnet = await isMainnet();
  return await snap.request({
    method: 'snap_createInterface',
    params: {
      ui: generateWatchFormComponent(onMainnet),
    },
  });
}

/**
 * Update the interface with the watch-only form containing an input and a submit button.
 *
 * @param id - The Snap interface ID to update.
 */
export async function showForm(id: string) {
  const onMainnet = await isMainnet();
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: generateWatchFormComponent(onMainnet),
    },
  });
}

/**
 * Update a Snap interface to show a success message.
 *
 * @param id - The Snap interface ID to update.
 * @param value - The value to display in the UI.
 * @param message - The message to display.
 * @param withSpinner - Whether to show a spinner.
 */
export async function showSuccess(
  id: string,
  value?: string,
  message?: string,
  withSpinner?: boolean,
) {
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: generateSuccessMessageComponent(value, message, withSpinner),
    },
  });
}

/**
 * Update a Snap interface to show an error message.
 *
 * @param id - The Snap interface ID to update.
 * @param message - The error message to display.
 */
export async function showErrorMessage(id: string, message: string) {
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: generateErrorMessageComponent(message),
    },
  });
}

/**
 * Update the Snap interface to show a loading spinner.
 *
 * @param id - The Snap interface ID to update.
 * @param message - The message to display.
 */
export async function showSpinner(id: string, message?: string) {
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: generateSpinnerComponent(message),
    },
  });
}
