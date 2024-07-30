import { RowVariant } from '@metamask/snaps-sdk';
import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Row, Text } from '@metamask/snaps-sdk/jsx';

export type ErrorMessageProps = {
  message: string;
};

export const ErrorMessage: SnapComponent<ErrorMessageProps> = ({
  message,
}: ErrorMessageProps) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - TS doesn't know about SnapComponent props
  return (
    <Row label="Error" variant={RowVariant.Critical}>
      <Text>{message}</Text>
    </Row>
  );
};
