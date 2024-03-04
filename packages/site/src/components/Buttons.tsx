import type { ComponentProps } from 'react';
import React from 'react';
import styled from 'styled-components';

import type { MetamaskState } from '../hooks';
import { shouldDisplayReconnectButton } from '../utils';
import { Button, ButtonSize, ButtonVariant } from './button';
import { IconName } from './icon';

const ConnectedContainer = styled.div`
  display: flex;
  align-self: flex-start;
  align-items: center;
  justify-content: center;
  font-size: ${(props) => props.theme.fontSizes.small};
  border-radius: ${(props) => props.theme.radii.button};
  border: 1px solid ${(props) => props.theme.colors.background?.inverse};
  background-color: ${(props) => props.theme.colors.background?.inverse};
  color: ${(props) => props.theme.colors.text?.inverse};
  font-weight: bold;
  padding: 1.2rem;
`;

const ConnectedIndicator = styled.div`
  content: ' ';
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: green;
`;

type ActionButtonProps = {
  width?: string;
};

const ActionButton = styled.button<ActionButtonProps>`
  width: ${(props) => props.width ?? '95%'};
  background-color: #0376c9;
  border-radius: 999px;
  border: none;
  padding: 5px 20px;
  margin: 8px 2.5% 8px 8px;

  &:hover {
    background-color: #0376ff;
    color: #fff;
  }
`;

export const InstallMetaMaskButton = () => (
  <Button
    variant={ButtonVariant.Primary}
    size={ButtonSize.Md}
    href={'https://metamask.io/'}
  >
    Install MetaMask
  </Button>
);

export const ConnectButton = (props: ComponentProps<typeof Button>) => {
  return (
    <Button
      variant={ButtonVariant.Primary}
      size={ButtonSize.Md}
      startIconName={IconName.MetaMaskFox}
      onClick={props.onClick}
    >
      Add to MetaMask
    </Button>
  );
};

export const ReconnectButton = (props: ComponentProps<typeof Button>) => {
  return (
    <Button
      variant={ButtonVariant.Primary}
      size={ButtonSize.Md}
      startIconName={IconName.MetaMaskFox}
      onClick={props.onClick}
    >
      Reconnect MetaMask
    </Button>
  );
};

export const UpdateButton = (props: ComponentProps<typeof Button>) => {
  return (
    <Button
      variant={ButtonVariant.Primary}
      size={ButtonSize.Md}
      startIconName={IconName.MetaMaskFox}
      onClick={props.onClick}
    >
      Update Snap
    </Button>
  );
};

export const HeaderButtons = ({
  state,
  updateAvailable,
  onConnectClick,
}: {
  state: MetamaskState;
  updateAvailable: boolean;
  onConnectClick(): unknown;
}) => {
  if (!state.hasMetaMask && !state.installedSnap) {
    return <InstallMetaMaskButton />;
  }

  if (!state.installedSnap) {
    return <ConnectButton onClick={onConnectClick} />;
  }

  if (updateAvailable) {
    return <UpdateButton onClick={onConnectClick} />;
  }

  if (shouldDisplayReconnectButton(state.installedSnap)) {
    return <ReconnectButton onClick={onConnectClick} />;
  }

  return (
    <ConnectedContainer>
      <ConnectedIndicator />
    </ConnectedContainer>
  );
};

export const MethodButton = (props: any) => {
  return (
    <ActionButton
      disabled={props.disabled}
      onClick={props.onClick}
      width={props.width}
    >
      {props.label}
    </ActionButton>
  );
};
