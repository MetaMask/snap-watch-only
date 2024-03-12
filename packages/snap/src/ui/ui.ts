import type { Component, Transaction } from '@metamask/snaps-sdk';
import {
  address,
  assert,
  divider,
  heading,
  ManageStateOperation,
  panel,
  row,
  text,
} from '@metamask/snaps-sdk';
import type { Hex } from '@metamask/utils';
import { add0x, getChecksumAddress } from '@metamask/utils';

import { generateWatchFormComponent } from './components';

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
 * Show cannot sign transaction error.
 *
 * @returns The transaction insight content.
 */
export async function showCannotSignMessage(): Promise<Component> {
  const snapState = await snap.request({
    method: 'snap_manageState',
    params: {
      operation: ManageStateOperation.GetState,
    },
  });

  assert(snapState?.transaction, 'No transaction found in Snap state.');

  const { from } = snapState.transaction as Transaction;

  return panel([
    row('Watch address:', address(getChecksumAddress(add0x(from)) as Hex)),
    row('Cannot sign transactions'),
  ]);
}

/**
 * Update the interface with the watch-only form containing an input and a submit button.
 *
 * @param id - The Snap interface ID to update.
 * @param validationMessage
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
      ui: panel([
        heading('Success'),
        divider(),
        text('You are now watching'),
        address(getChecksumAddress(add0x(value)) as Hex),
      ]),
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
      ui: panel([heading('Error'), divider(), text(message)]),
    },
  });
}
