import React from 'react';

import { IconColor } from '../helpers/constants/design-system';

import type {
  StyleUtilityProps,
  PolymorphicComponentPropWithRef,
} from '../box';

export enum IconSize {
  Xs = 'xs',
  Sm = 'sm',
  Md = 'md',
  Lg = 'lg',
  Xl = 'xl',
  Inherit = 'inherit',
}

/**
 * The IconName enum contains all the possible icon names.
 */

export enum IconName {
  Loading = 'loading',
  MetaMaskFox = 'metamask-fox',
}

export interface IconStyleUtilityProps extends StyleUtilityProps {
  /**
   * The name of the icon to display. Use the IconName enum
   * Search for an icon: https://metamask.github.io/metamask-storybook/?path=/story/components-componentlibrary-icon--default-story
   */
  name: IconName;
  /**
   * The size of the Icon.
   * Possible values could be IconSize.Xs (12px), IconSize.Sm (16px), IconSize.Md (20px), IconSize.Lg (24px), IconSize.Xl (32px), IconSize.Inherit (inherits font-size).
   * Default value is IconSize.Md (20px).
   */
  size?: IconSize;
  /**
   * The color of the icon.
   * Defaults to IconColor.inherit.
   */
  color?: IconColor;
  /**
   * An additional className to apply to the icon.
   */
  className?: string;
  /**
   * Addition style properties to apply to the icon.
   * The Icon component uses inline styles to apply the icon's mask-image so be wary of overriding
   */
  style?: React.CSSProperties;
}

export type IconProps<C extends React.ElementType> =
  PolymorphicComponentPropWithRef<C, IconStyleUtilityProps>;

export type IconComponent = <C extends React.ElementType = 'span'>(
  props: IconProps<C>,
) => React.ReactElement | null;
