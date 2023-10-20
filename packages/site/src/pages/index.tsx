import type { KeyringAccount, KeyringRequest } from '@metamask/keyring-api';
import { KeyringSnapRpcClient } from '@metamask/keyring-api';
import Grid from '@mui/material/Grid';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import {
  Accordion,
  AccountList,
  Card,
  ConnectButton,
  Toggle,
} from '../components';
import {
  CardContainer,
  Container,
  Divider,
  DividerTitle,
  StyledBox,
} from '../components/styledComponents';
import { defaultSnapOrigin } from '../config';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import { InputType } from '../types';
import type { ManagementMethod } from '../types/inputs';
import type { KeyringState } from '../utils';
import {
  connectSnap,
  getSnap,
  isSynchronousMode,
  resolveName,
  toggleSynchronousApprovals,
} from '../utils';
import { personalSign, signTypedDataV4 } from '../utils/sign';

const snapId = defaultSnapOrigin;

const initialState: {
  pendingRequests: KeyringRequest[];
  accounts: KeyringAccount[];
  useSynchronousApprovals: boolean;
} = {
  pendingRequests: [],
  accounts: [],
  useSynchronousApprovals: true,
};

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [snapState, setSnapState] = useState<KeyringState>(initialState);
  const [address, setAddress] = useState<string | null>();
  const [accountId, setAccountId] = useState<string | null>();
  const [personalSignMsg, setPersonalSignMsg] = useState<string | null>(null);
  const [signTypedDataV4Msg, setSignTypedDataV4Msg] = useState<string | null>(
    null,
  );
  // const [accountPayload, setAccountPayload] =
  //   useState<Pick<KeyringAccount, 'name' | 'options'>>();
  const client = new KeyringSnapRpcClient(snapId, window.ethereum);

  useEffect(() => {
    /**
     * Return the current state of the snap.
     *
     * @returns The current state of the snap.
     */
    async function getState() {
      if (!state.installedSnap) {
        return;
      }
      const accounts = await client.listAccounts();
      const pendingRequests = await client.listRequests();
      const isSynchronous = await isSynchronousMode();
      setSnapState({
        accounts,
        pendingRequests,
        useSynchronousApprovals: isSynchronous,
      });
    }

    getState().catch((error) => console.error(error));
  }, [state.installedSnap]);

  const createAccount = async () => {
    const newAccount = await client.createAccount();
    const accounts = await client.listAccounts();
    setSnapState({
      ...snapState,
      accounts,
    });
    return newAccount;
  };

  const importWatchOnlyAccount = async () => {
    const newAccount = await client.createAccount({
      address: address as string,
    });
    const accounts = await client.listAccounts();
    setSnapState({
      ...snapState,
      accounts,
    });
    return newAccount;
  };

  const deleteAccount = async () => {
    await client.deleteAccount(accountId as string);
    const accounts = await client.listAccounts();
    setSnapState({
      ...snapState,
      accounts,
    });
  };

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (error) {
      console.error(error);
      dispatch({ type: MetamaskActions.SetError, payload: error });
    }
  };

  const handleUseSyncToggle = useCallback(async () => {
    console.log('Toggling synchronous approval');
    await toggleSynchronousApprovals();
    setSnapState({
      ...snapState,
      useSynchronousApprovals: !snapState.useSynchronousApprovals,
    });
  }, [snapState]);

  const accountManagementMethods: ManagementMethod[] = [
    {
      name: 'Create watch-only account',
      description: 'Create a new account',
      inputs: [],
      action: {
        callback: async () => await createAccount(),
        label: 'Create Account',
      },
      successMessage: 'Account created',
    },
    {
      name: 'Import watch-only account',
      description: 'Import a watch-only account from a public address',
      inputs: [
        {
          id: 'import-account-public-address',
          title: 'Public Address or ENS Name',
          value: address,
          type: InputType.TextField,
          placeholder: 'E.g. 0xda1D3...7d891 or example.eth',
          onChange: async (event: any) => {
            const addressInput = event.currentTarget.value;
            setAddress(addressInput);
            if (addressInput.endsWith('.eth')) {
              const checkSumAddr = await resolveName(addressInput);
              setAddress(checkSumAddr);
            }
          },
        },
      ],
      action: {
        callback: async () => await importWatchOnlyAccount(),
        label: 'Import Watch-Only Account',
      },
      successMessage: 'Watch-only account imported',
    },
    {
      name: 'Get account',
      description: 'Get data of the selected account',
      inputs: [
        {
          id: 'get-account-account-id',
          title: 'Account ID',
          type: InputType.TextField,
          placeholder: 'E.g. f59a9562-96de-4e75-9229-079e82c7822a',
          options: snapState.accounts.map((account) => {
            return { value: account.address };
          }),
          onChange: (event: any) => setAccountId(event.currentTarget.value),
        },
      ],
      action: {
        disabled: Boolean(accountId),
        callback: async () => await client.getAccount(accountId as string),
        label: 'Get Account',
      },
      successMessage: 'Account fetched',
    },
    {
      name: 'List accounts',
      description: 'List all account managed by the SSK',
      action: {
        disabled: false,
        callback: async () => {
          const accounts = await client.listAccounts();
          setSnapState({
            ...snapState,
            accounts,
          });
          return accounts;
        },
        label: 'List Accounts',
      },
    },
    {
      name: 'Remove account',
      description: 'Remove an account',
      inputs: [
        {
          id: 'delete-account-account-id',
          title: 'Account ID',
          type: InputType.TextField,
          placeholder: 'E.g. 394bd587-7be4-4ffb-a113-198c6a7764c2',
          options: snapState.accounts.map((account) => {
            return { value: account.address };
          }),
          onChange: (event: any) => setAccountId(event.currentTarget.value),
        },
      ],
      action: {
        disabled: Boolean(accountId),
        callback: async () => await deleteAccount(),
        label: 'Remove Account',
      },
      successMessage: 'Account Removed',
    },
  ];

  const signMethods: ManagementMethod[] = [
    {
      name: 'Personal Sign',
      description: 'Sign a message using "personal_sign"',
      inputs: [
        {
          id: 'personal-sign-message',
          title: 'Message',
          type: InputType.TextField,
          placeholder: 'E.g. Example "personal_sign" message',
          onChange: (event: any) =>
            setPersonalSignMsg(event.currentTarget.value),
        },
      ],
      action: {
        enabled: Boolean(personalSignMsg),
        callback: async () => await personalSign(personalSignMsg as string),
        label: 'Personal Sign Message',
      },
      successMessage: 'Personal message signed',
    },
    {
      name: 'Sign Typed Data V4',
      description: 'Sign a message using "eth_signTypedData_v4"',
      inputs: [
        {
          id: 'typed-data-v4-message',
          title: 'Contents',
          type: InputType.TextField,
          placeholder: 'E.g. Message contents for typed data V4',
          onChange: (event: any) => {
            setSignTypedDataV4Msg(event.currentTarget.value);
          },
        },
      ],
      action: {
        enabled: Boolean(signTypedDataV4Msg),
        callback: async () =>
          await signTypedDataV4(signTypedDataV4Msg as string),
        label: 'Sign Typed Data V4',
      },
      successMessage: 'Typed data V4 signed',
    },
  ];
  return (
    <Container>
      <CardContainer>
        {!state.installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the example snap.',
              button: (
                <ConnectButton
                  onClick={handleConnectClick}
                  disabled={!state.hasMetaMask}
                />
              ),
            }}
            disabled={!state.hasMetaMask}
          />
        )}
      </CardContainer>

      <StyledBox sx={{ flexGrow: 1 }}>
        <Grid container spacing={4} columns={[1, 2, 3]}>
          <Grid item xs={8} sm={4} md={2}>
            <DividerTitle>Options</DividerTitle>
            <Toggle
              title="Use Synchronous Approval"
              defaultChecked={snapState.useSynchronousApprovals}
              onToggle={handleUseSyncToggle}
              enabled={Boolean(state.installedSnap)}
            />
            <Divider>&nbsp;</Divider>
            <DividerTitle>Methods</DividerTitle>
            <Accordion items={accountManagementMethods} />
            <Divider />
            <DividerTitle>Sign Methods</DividerTitle>
            <Accordion items={signMethods} />
            <Divider />
          </Grid>
          <Grid item xs={4} sm={2} md={1}>
            <Divider />
            <DividerTitle>Accounts</DividerTitle>
            <AccountList
              accounts={snapState.accounts}
              handleDelete={async (accountIdToDelete) => {
                await client.deleteAccount(accountIdToDelete);
                const accounts = await client.listAccounts();
                setSnapState({
                  ...snapState,
                  accounts,
                });
              }}
            />
          </Grid>
        </Grid>
      </StyledBox>
    </Container>
  );
};
export default Index;
