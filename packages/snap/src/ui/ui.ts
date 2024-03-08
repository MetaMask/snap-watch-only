import type { Component, Transaction } from '@metamask/snaps-sdk';
import {
  ButtonType,
  form,
  input,
  address,
  assert,
  button,
  divider,
  heading,
  ManageStateOperation,
  panel,
  row,
  text,
} from '@metamask/snaps-sdk';

import { generateWatchFormComponent } from './components';
import { decodeData } from './ui-utils';

/**
 * Initiate a new interface with the starting screen.
 *
 * @returns The Snap interface ID.
 */
export async function createInterface(): Promise<string> {
  return await snap.request({
    method: 'snap_createInterface',
    params: {
      ui: generateWatchFormComponent(null),
    },
  });
}

/**
 * Create the transaction insights components to display.
 *
 * @returns The transaction insight content.
 */
export async function getInsightContent(): Promise<Component> {
  const snapState = await snap.request({
    method: 'snap_manageState',
    params: {
      operation: ManageStateOperation.GetState,
    },
  });

  assert(snapState?.transaction, 'No transaction found in Snap state.');

  const { from, to } = snapState.transaction as Transaction;

  return panel([
    row('From', address(from)),
    row('To', to ? address(to) : text('None')),
    button({ value: 'See transaction type', name: 'transaction-type' }),
  ]);
}

/**
 * Update a Snap interface to display the transaction type after fetching
 * the transaction from state.
 *
 * @param id - The interface ID to update.
 */
export async function displayTransactionType(id: string) {
  const snapState = await snap.request({
    method: 'snap_manageState',
    params: {
      operation: ManageStateOperation.GetState,
    },
  });

  assert(snapState?.transaction, 'No transaction found in Snap state.');

  const transaction = snapState.transaction as Transaction;

  const type = decodeData(transaction.data);

  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: panel([
        row('Transaction type', text(type)),
        button({ value: 'Go back', name: 'go-back' }),
      ]),
    },
  });
}

/**
 * Update the interface with a simple form containing an input and a submit button.
 *
 * @param id - The Snap interface ID to update.
 * @param validationMessage
 */
export async function showForm(id: string, validationMessage: string) {
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: generateWatchFormComponent(validationMessage),
    },
  });
}

/**
 * Update a Snap interface to show a given value.
 *
 * @param id - The Snap interface ID to update.
 * @param value - The value to display in the UI.
 */
export async function showResult(id: string, value: string) {
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: panel([
        heading('Success'),
        divider(),
        text('You are now watching'),
        address(value),
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
