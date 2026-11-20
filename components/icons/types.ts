import type { ComponentType } from 'react';

export type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  accessibilityLabel?: string;
};

export type IconComponent = ComponentType<IconProps>;

export const ICON_DEFAULTS = {
  size: 24,
  strokeWidth: 1.5,
} as const;
