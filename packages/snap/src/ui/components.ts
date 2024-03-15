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
  WATCH_FORM_HEADER,
  WATCH_FORM_INPUT_LABEL,
  WATCH_FORM_INPUT_PLACEHOLDER,
  WATCH_FORM_INSTRUCTIONS,
} from './content';

/**
 * Generate the watch form component.
 *
 * @param validationMessage - The validation message to display (if any).
 * @returns The watch form component to display.
 */
export function generateWatchFormComponent(
  validationMessage?: string,
): Component {
  switch (validationMessage) {
    case undefined:
      return panel([
        heading(WATCH_FORM_HEADER),
        text(WATCH_FORM_DESCRIPTION),
        divider(),
        text(WATCH_FORM_INSTRUCTIONS),
        form({
          name: 'address-form',
          children: [
            input({
              name: 'address-input',
              label: WATCH_FORM_INPUT_LABEL,
              placeholder: WATCH_FORM_INPUT_PLACEHOLDER,
            }),
            button({
              variant: ButtonVariant.Primary,
              value: 'Watch account',
              name: 'submit',
              buttonType: ButtonType.Submit,
            }),
          ],
        }),
      ]);
    default:
      return panel([
        heading(WATCH_FORM_HEADER),
        text(WATCH_FORM_DESCRIPTION),
        divider(),
        text(WATCH_FORM_INSTRUCTIONS),
        form({
          name: 'address-form',
          children: [
            input({
              name: 'address-input',
              label: WATCH_FORM_INPUT_LABEL,
              placeholder: WATCH_FORM_INPUT_PLACEHOLDER,
            }),
            button({
              variant: ButtonVariant.Primary,
              value: 'Watch account',
              name: 'submit',
              buttonType: ButtonType.Submit,
            }),
          ],
        }),
        text(validationMessage),
      ]);
  }
}

/**
 * Generate the success message component.
 *
 * @param value - The value to display in the UI.
 * @returns The success message component to display.
 */
export function generateSuccessMessageComponent(value: string): Component {
  if (isValidHexAddress(value as Hex) || isValidAddress(value)) {
    return panel([
      heading('Success'),
      divider(),
      text('You are now watching'),
      address(getChecksumAddress(add0x(value)) as Hex),
    ]);
  }
  return panel([heading('Success'), divider(), text(value)]);
}

/**
 * Generate the error message component.
 *
 * @param message - The error message to display.
 * @returns The error message component to display.
 */
export function generateErrorMessageComponent(message: string): Component {
  return panel([heading('Error'), divider(), text(message)]);
}
