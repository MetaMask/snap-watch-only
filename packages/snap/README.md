# Watch Only Keyring Snap

This repository contains a keyring snap for watch-only accounts.

Keyring snaps enable developers to enhance MetaMask by adding new account
types. These accounts are natively supported within the extension, appearing in
MetaMask's UI, and can be used with dapps.

Watch-only snap accounts do not have private keys and the user is not be able to sign transactions and messages. This Snap allows the user to create a watch-only account or provide a public address and import a watch-only account into the MetaMask UI.

MetaMask Snaps is a system that allows anyone to safely expand the capabilities
of MetaMask. A _snap_ is a program that we run in an isolated environment that
can customize the wallet experience.

## `@metamask/interactive-ui-example-snap`

This snap demonstrates how to use interactive UI to build reactive custom UI interfaces across all the available APIs.

## Snap usage

### onRpcRequest

This snap exposes an `onRpcRequest` handler, which supports the following
JSON-RPC methods:

- `dialog`: Create a `snap_dialog` with an interactive interface. This demonstrates that a snap can show an interactive `snap_dialog` that the user can interact with.

- `getState`: Get the state of a given interface. This demonstrates that a snap can retrieve an interface state.

### onTransaction

This snap exposes an `onTransaction` handler, which is called when a transaction  
is sent by the user. It shows a user interface with details about the transaction.

### onHomePage

The snap exposes an `onHomePage` handler, which shows a user interface.

For more information, you can refer to
[the end-to-end tests](src/ui/index.test.ts).
