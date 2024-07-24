import { ButtonType } from '@metamask/snaps-sdk';
import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import {
  Box,
  Button,
  Field,
  Form,
  Heading,
  Input,
  Text,
} from '@metamask/snaps-sdk/jsx';

import {
  WATCH_FORM_DESCRIPTION,
  WATCH_FORM_DESCRIPTION_MAINNET,
  WATCH_FORM_HEADER,
  WATCH_FORM_INPUT_LABEL,
  WATCH_FORM_INPUT_PLACEHOLDER,
  WATCH_FORM_INPUT_PLACEHOLDER_MAINNET,
  WATCH_FORM_INSTRUCTIONS,
} from '../content';

export enum WatchFormNames {
  AddressForm = 'address-form',
  AddressInput = 'address-input',
  SubmitButton = 'submit',
  CancelButton = 'cancel',
}

export type WatchFormProps = {
  onMainnet: boolean;
};

export const WatchForm: SnapComponent<WatchFormProps> = ({
  onMainnet,
}: WatchFormProps) => {
  return (
    <Box>
      <Heading>{WATCH_FORM_HEADER}</Heading>
      <Text>
        {onMainnet ? WATCH_FORM_DESCRIPTION_MAINNET : WATCH_FORM_DESCRIPTION}
      </Text>
      <Text>{WATCH_FORM_INSTRUCTIONS}</Text>
      <Form name={WatchFormNames.AddressForm}>
        <Field label={WATCH_FORM_INPUT_LABEL}>
          <Input
            name={WatchFormNames.AddressInput}
            type="text"
            placeholder={
              onMainnet
                ? WATCH_FORM_INPUT_PLACEHOLDER_MAINNET
                : WATCH_FORM_INPUT_PLACEHOLDER
            }
          />
        </Field>
        <Box direction="horizontal" alignment="space-around">
          {/* TODO: Future snaps release will allow routing to extension home page */}
          {/* <Button*/}
          {/*  name={WatchFormNames.CancelButton}*/}
          {/*  type={ButtonType.Button}*/}
          {/*  variant="destructive"*/}
          {/* >*/}
          {/*  Cancel*/}
          {/* </Button>*/}
          <Button
            name={WatchFormNames.SubmitButton}
            type={ButtonType.Submit}
            variant="primary"
          >
            Watch
          </Button>
        </Box>
      </Form>
    </Box>
  );
};
