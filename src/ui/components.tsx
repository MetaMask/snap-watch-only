import { isValidAddress } from '@ethereumjs/util';
import { ButtonType, ButtonVariant, RowVariant } from '@metamask/snaps-sdk';
import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import {
  Address,
  Box,
  Button,
  Divider,
  Field,
  Form,
  Heading,
  Input,
  Row,
  Spinner,
  Text,
} from '@metamask/snaps-sdk/jsx';
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
export function generateWatchFormComponent(): SnapComponent {
  return (
    <Box>
      <Heading>{WATCH_FORM_HEADER}</Heading>
      <Text>{WATCH_FORM_DESCRIPTION}</Text>
      <Text>{WATCH_FORM_INSTRUCTIONS}</Text>
      <Form name={WatchFormNames.AddressForm}>
        <Field label={WATCH_FORM_INPUT_LABEL}>
          <Input
            name={WatchFormNames.AddressInput}
            type="text"
            placeholder={WATCH_FORM_INPUT_PLACEHOLDER}
          />
          <Button
            name={WatchFormNames.SubmitButton}
            type={ButtonType.Submit}
            variant={ButtonVariant.Primary}
          >
            Watch account
          </Button>
        </Field>
      </Form>
    </Box>
  );
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
): SnapComponent {
  return (
    <Box>
      <Heading>Success</Heading>
      <Divider />
      <Text>{message}</Text>
      {value && (isValidHexAddress(value as Hex) || isValidAddress(value)) ? (
        <Address address={getChecksumAddress(add0x(value)) as Hex} />
      ) : (
        <Text>{value}</Text>
      )}
      {withSpinner && <Spinner />}
    </Box>
  );
}

/**
 * Generate the error message component.
 *
 * @param message - The error message to display.
 * @returns The error message component to display.
 */
export function generateErrorMessageComponent(message: string): SnapComponent {
  return (
    <Row label="Error" variant={RowVariant.Critical}>
      <Text>{message}</Text>
    </Row>
  );
}

/**
 * Generate spinner component.
 *
 * @param message - The message to display.
 * @returns The spinner component to display.
 */
export function generateSpinnerComponent(message?: string): SnapComponent {
  return (
    <Box>
      <Heading>Processing</Heading>
      <Divider />
      {message && <Text>{message}</Text>}
      <Spinner />
    </Box>
  );
}
