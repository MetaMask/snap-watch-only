import { RowVariant } from '@metamask/snaps-sdk';
import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Row, Text } from '@metamask/snaps-sdk/jsx';

export type ErrorMessageProps = {
  message: string;
};

export const ErrorMessage: SnapComponent<ErrorMessageProps> = ({
  message,
}: ErrorMessageProps) => {
  return (
    <Row label="Error" variant={RowVariant.Critical}>
      <Text>{message}</Text>
    </Row>
  );
};
