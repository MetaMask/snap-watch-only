// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { isValidAddress } from '@ethereumjs/util';
import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import {
  Address,
  Box,
  Divider,
  Heading,
  Spinner,
  Text,
} from '@metamask/snaps-sdk/jsx';
import type { Hex } from '@metamask/utils';
import { add0x, getChecksumAddress, isValidHexAddress } from '@metamask/utils';

export type SuccessMessageProps = {
  value?: string;
  message?: string;
  withSpinner?: boolean;
};

export const SuccessMessage: SnapComponent<SuccessMessageProps> = ({
  value,
  message,
  withSpinner,
}: SuccessMessageProps) => {
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
};
