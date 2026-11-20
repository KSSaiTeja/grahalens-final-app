import Svg, { Path } from 'react-native-svg';
import type { IconProps } from '../types';
import { ICON_DEFAULTS } from '../types';

export function Offline({
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
      accessibilityLabel={accessibilityLabel ?? 'Offline'}
    >
      <Path
        d="M4.5 9.5c4-3.5 11-3.5 15 0M7 12.5c2.8-2.2 7.2-2.2 10 0M9.8 15.5c1.3-1 3.1-1 4.4 0"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6 18.5 18 6.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
