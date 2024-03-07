import type { Component } from '@metamask/snaps-sdk';
import {
  button,
  ButtonType,
  divider,
  form,
  heading,
  input,
  panel,
  text,
} from '@metamask/snaps-sdk';

import {
  WATCH_FORM_DESCRIPTION,
  WATCH_FORM_HEADER,
  WATCH_FORM_INPUT_PLACEHOLDER,
  WATCH_FORM_INSTRUCTIONS,
} from './content';

export const WATCH_FORM_COMPONENT: Component = panel([
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
      button('Watch account', ButtonType.Submit, 'submit'),
    ],
  }),
]);
