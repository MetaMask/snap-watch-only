import type { KeyringAccount } from '@metamask/keyring-api';
import { KeyringSnapRpcClient } from '@metamask/keyring-api';
import Grid from '@mui/material/Grid';
import React, { useContext, useEffect, useState } from 'react';

import { Accordion, Card, ConnectButton } from '../components';
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
import { connectSnap, getSnap, resolveName } from '../utils';

const snapId = defaultSnapOrigin;

const initialState: {
  accounts: KeyringAccount[];
} = {
  accounts: [],
};

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [snapState, setSnapState] = useState<KeyringState>(initialState);
  const [address, setAddress] = useState<string | null>();
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
      setSnapState({
        accounts,
      });
    }

    getState().catch((error) => console.error(error));
  }, [state.installedSnap]);

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

  const accountManagementMethods: ManagementMethod[] = [
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
            <Divider>&nbsp;</Divider>
            <DividerTitle>Methods</DividerTitle>
            <Accordion items={accountManagementMethods} />
            <Divider />
          </Grid>
        </Grid>
      </StyledBox>
    </Container>
  );
};
export default Index;
