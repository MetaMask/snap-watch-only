import type { SnapComponent } from '@metamask/snaps-sdk/jsx';

import { ErrorMessage } from './ErrorMessage';
import { SpinnerWithMessage } from './SpinnerWithMessage';
import type { SuccessMessageProps } from './SuccessMessage';
import { SuccessMessage } from './SuccessMessage';
import { WatchForm } from './WatchForm';

/**
 * Generate the watch form component.
 *
 * @returns The watch form component to display.
 */
export function generateWatchFormComponent(): SnapComponent {
  return <WatchForm />;
}

/**
 * Generate the success message component.
 *
 * @param props - The props to pass to the success message component.
 * @returns The success message component to display.
 */
export function generateSuccessMessageComponent(
  props?: SuccessMessageProps,
): SnapComponent {
  return <SuccessMessage {...props} />;
}

/**
 * Generate the error message component.
 *
 * @param message - The error message to display.
 * @returns The error message component to display.
 */
export function generateErrorMessageComponent(message: string): SnapComponent {
  return <ErrorMessage message={message} />;
}

/**
 * Generate spinner component.
 *
 * @param message - The message to display.
 * @returns The spinner component to display.
 */
export function generateSpinnerComponent(message?: string): SnapComponent {
  return <SpinnerWithMessage message={message ?? ''} />;
}
