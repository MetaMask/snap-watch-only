import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Divider, Heading, Spinner, Text } from '@metamask/snaps-sdk/jsx';

export type SpinnerWithMessageProps = {
  message?: string;
};

export const SpinnerWithMessage: SnapComponent<SpinnerWithMessageProps> = ({
  message,
}: SpinnerWithMessageProps) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - TS doesn't know about SnapComponent props
  return (
    <Box>
      <Heading>Processing</Heading>
      <Divider />
      {message && <Text>{message}</Text>}
      <Spinner />
    </Box>
  );
};
