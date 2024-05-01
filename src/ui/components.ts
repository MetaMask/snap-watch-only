import { isValidAddress } from '@ethereumjs/util';
import type { Component } from '@metamask/snaps-sdk';
import {
  address,
  button,
  ButtonType,
  ButtonVariant,
  divider,
  form,
  heading,
  input,
  panel,
  row,
  RowVariant,
  spinner,
  text,
} from '@metamask/snaps-sdk';
import {
  add0x,
  getChecksumAddress,
  type Hex,
  isValidHexAddress,
} from '@metamask/utils';

import {
  WATCH_FORM_DESCRIPTION,
  WATCH_FORM_ENS_DISCLAIMER,
  WATCH_FORM_HEADER,
  WATCH_FORM_INPUT_LABEL,
  WATCH_FORM_INPUT_PLACEHOLDER,
  WATCH_FORM_INSTRUCTIONS,
} from './content';

export enum WatchFormNames {
  AddressForm = 'address-form',
  AddressInput = 'address-input',
  SubmitButton = 'submit',
}

/**
 * Generate the watch form component.
 *
 * @returns The watch form component to display.
 */
export function generateWatchFormComponent(): Component {
  return panel([
    heading(WATCH_FORM_HEADER),
    text(WATCH_FORM_DESCRIPTION),
    text(WATCH_FORM_INSTRUCTIONS),
    form({
      name: WatchFormNames.AddressForm,
      children: [
        input({
          name: WatchFormNames.AddressInput,
          label: WATCH_FORM_INPUT_LABEL,
          placeholder: WATCH_FORM_INPUT_PLACEHOLDER,
        }),
        button({
          variant: ButtonVariant.Primary,
          value: 'Watch account',
          name: WatchFormNames.SubmitButton,
          buttonType: ButtonType.Submit,
        }),
      ],
    }),
    text(WATCH_FORM_ENS_DISCLAIMER),
  ]);
}

/**
 * Generate the success message component.
 *
 * @param value - The value to display in the UI.
 * @param message - The message to display.
 * @param withSpinner - Whether to show a spinner.
 * @returns The success message component to display.
 */
export function generateSuccessMessageComponent(
  value?: string,
  message?: string,
  withSpinner?: boolean,
): Component {
  if (value && (isValidHexAddress(value as Hex) || isValidAddress(value))) {
    if (withSpinner) {
      return panel([
        heading('Success'),
        divider(),
        text(message),
        address(getChecksumAddress(add0x(value)) as Hex),
        spinner(),
      ]);
    }
    return panel([
      heading('Success'),
      divider(),
      text(message),
      address(getChecksumAddress(add0x(value)) as Hex),
    ]);
  }
  if (withSpinner) {
    return panel([
      heading('Success'),
      divider(),
      text(message),
      text(value),
      spinner(),
    ]);
  }
  return panel([heading('Success'), divider(), text(message), text(value)]);
}

/**
 * Generate the error message component.
 *
 * @param message - The error message to display.
 * @returns The error message component to display.
 */
export function generateErrorMessageComponent(message: string): Component {
  return panel([
    row({
      label: 'Error',
      value: text(message),
      variant: RowVariant.Critical,
    }),
  ]);
}

/**
 * Generate spinner component.
 *
 * @param message - The message to display.
 * @returns The spinner component to display.
 */
export function generateSpinnerComponent(message?: string): Component {
  if (!message) {
    return panel([heading('Processing'), divider(), spinner()]);
  }
  return panel([heading('Processing'), divider(), text(message), spinner()]);
}
