import Svg, { Circle, Path } from 'react-native-svg';
import type { IconProps } from '../types';
import { ICON_DEFAULTS } from '../types';

export function TabBonds({
  size = ICON_DEFAULTS.size,
  color = '#EDE9E1',
  strokeWidth = ICON_DEFAULTS.strokeWidth,
  accessibilityLabel,
}: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityLabel={accessibilityLabel ?? 'Bonds'}
    >
      <Circle cx="8" cy="10" r="2.4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Circle cx="16" cy="14" r="2.4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path
        d="M10.2 11.2c1.4.6 2.4 1.4 3.6 2.2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
