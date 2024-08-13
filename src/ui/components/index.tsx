import { ErrorMessage } from './ErrorMessage';
import { SpinnerWithMessage } from './SpinnerWithMessage';
import type { SuccessMessageProps } from './SuccessMessage';
import { SuccessMessage } from './SuccessMessage';
import { WatchForm } from './WatchForm';

/**
 * Generate the watch form component.
 *
 * @param onMainnet - Whether the user is on the mainnet.
 * @returns The watch form component to display.
 */
export function generateWatchFormComponent(onMainnet: boolean): JSX.Element {
  return <WatchForm onMainnet={onMainnet} />;
}

/**
 * Generate the success message component.
 *
 * @param props - The props to pass to the success message component.
 * @returns The success message component to display.
 */
export function generateSuccessMessageComponent(
  props?: SuccessMessageProps,
): JSX.Element {
  return <SuccessMessage {...props} />;
}

/**
 * Generate the error message component.
 *
 * @param message - The error message to display.
 * @returns The error message component to display.
 */
export function generateErrorMessageComponent(message: string): JSX.Element {
  return <ErrorMessage message={message} />;
}

/**
 * Generate spinner component.
 *
 * @param message - The message to display.
 * @returns The spinner component to display.
 */
export function generateSpinnerComponent(message?: string): JSX.Element {
  return <SpinnerWithMessage message={message ?? ''} />;
}
