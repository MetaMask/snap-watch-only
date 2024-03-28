# Account Watcher Snap

This repository contains a keyring snap for watch-only accounts.

Keyring snaps enable developers to enhance MetaMask by adding new account
types. These accounts are natively supported within the extension, appearing in
MetaMask's UI, and can be used with dapps.

With Account Watcher by MetaMask, you can keep an eye on any account – even accounts you don’t own. Ideal for tracking and observing any account, all without leaving the comfort of your MetaMask wallet.

Just enter a public address or ENS domain, and you can watch transactions and balances right from within MetaMask. But remember, you can’t use Account Watcher to sign transactions or messages.

MetaMask Snaps is a system that allows anyone to safely expand the capabilities
of MetaMask. A _snap_ is a program that we run in an isolated environment that
can customize the wallet experience.

## Snap usage

### onKeyringRequest

The snap exposes an `onKeyringRequest` handler, which called by the MetaMask client for privileged keyring actions.

### onHomePage

The snap exposes an `onHomePage` handler, which shows a user interface.

### onUserInput

The snap exposes an `onUserInput` handler, which handles incoming user events coming from the MetaMask clients open interfaces.

For more information, you can refer to
[the end-to-end tests](src/ui/index.test.ts).
