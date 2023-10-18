import { type KeyringAccount } from '@metamask/keyring-api';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React, { useState } from 'react';

import { MethodButton } from './Buttons';
import { CopyableItem } from './CopyableItem';
import {
  AccountContainer,
  AccountRow,
  AccountRowTitle,
  AccountRowValue,
  AccountTitle,
  AccountTitleContainer,
  AccountTitleIconContainer,
} from './styledComponents';

export const Account = ({
  account,
  handleDelete,
}: {
  account: KeyringAccount;
  handleDelete: (accountId: string) => Promise<void>;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <AccountContainer>
      <AccountTitleContainer>
        <AccountTitle>{account.address}</AccountTitle>
        <AccountTitleIconContainer>
          {isCollapsed ? (
            <ExpandMoreIcon
              fontSize="large"
              onClick={() => setIsCollapsed(!isCollapsed)}
            />
          ) : (
            <ExpandLessIcon
              fontSize="large"
              onClick={() => setIsCollapsed(!isCollapsed)}
            />
          )}
        </AccountTitleIconContainer>
      </AccountTitleContainer>
      {!isCollapsed && (
        <>
          <AccountRow>
            <AccountRowTitle>ID</AccountRowTitle>
            <CopyableItem value={account.id} />
          </AccountRow>
          <AccountRow>
            <AccountRowTitle>Address</AccountRowTitle>
            <CopyableItem value={account.address} />
          </AccountRow>
          <AccountRow>
            <AccountRowTitle>Type</AccountRowTitle>
            <AccountRowValue>{account.type}</AccountRowValue>
          </AccountRow>
          <AccountRow>
            <AccountRowTitle>Account Supported Methods</AccountRowTitle>
            !account.methods.length && (
            <AccountRowValue>Watch Only Account</AccountRowValue>)
            <ul style={{ padding: '0px 0px 0px 16px' }}>
              {account.methods.map((method, methodIndex) => (
                <AccountRowValue
                  key={`account-${account.id}-method-${methodIndex}`}
                >
                  <li>{method}</li>
                </AccountRowValue>
              ))}
            </ul>
          </AccountRow>
        </>
      )}
      <AccountRow alignItems="flex-end">
        <MethodButton
          width="30%"
          onClick={async (): Promise<void> => {
            await handleDelete(account.id);
          }}
          label="Delete"
        />
      </AccountRow>
    </AccountContainer>
  );
};
