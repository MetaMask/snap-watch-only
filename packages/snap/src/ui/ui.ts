import {
  generateErrorMessageComponent,
  generateSpinnerComponent,
  generateSuccessMessageComponent,
  generateWatchFormComponent,
} from './components';

/**
 * Initiate a new interface with the starting screen.
 *
 * @returns The Snap interface ID.
 */
export async function createInterface(): Promise<string> {
  return await snap.request({
    method: 'snap_createInterface',
    params: {
      ui: generateWatchFormComponent(),
    },
  });
}

/**
 * Update the interface with the watch-only form containing an input and a submit button.
 *
 * @param id - The Snap interface ID to update.
 * @param validationMessage - The validation message to display.
 */
export async function showForm(id: string, validationMessage?: string) {
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: generateWatchFormComponent(validationMessage),
    },
  });
}

/**
 * Update a Snap interface to show a success message.
 *
 * @param id - The Snap interface ID to update.
 * @param value - The value to display in the UI.
 */
export async function showSuccess(id: string, value: string) {
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: generateSuccessMessageComponent(value),
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
