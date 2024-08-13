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
  const renderAddressOrValueText = () => {
    if (value && (isValidHexAddress(value as Hex) || isValidAddress(value))) {
      return <Address address={getChecksumAddress(add0x(value)) as Hex} />;
    } else if (value) {
      return <Text>{value}</Text>;
    }
    return null;
  };

  return (
    <Box>
      <Heading>Success</Heading>
      <Divider />
      {message ? <Text>{message}</Text> : null}
      {renderAddressOrValueText()}
      {withSpinner ? <Spinner /> : null}
    </Box>
  );
};
