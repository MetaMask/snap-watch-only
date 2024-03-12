import {
  ButtonVariant,
  divider,
  button,
  ButtonType,
  form,
  heading,
  input,
  panel,
  text,
} from '@metamask/snaps-sdk';
import type { Component } from '@metamask/snaps-sdk';

import {
  WATCH_FORM_DESCRIPTION,
  WATCH_FORM_HEADER,
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
