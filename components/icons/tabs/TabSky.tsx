import Svg, { Circle, Path } from 'react-native-svg';
import type { IconProps } from '../types';
import { ICON_DEFAULTS } from '../types';

export function TabSky({
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
      accessibilityLabel={accessibilityLabel ?? 'Sky'}
    >
      <Path
        d="M3 17.5c2.5-1.2 4.8-1.8 7-1.8s4.5.6 7 1.8 4.5 1.8 7 1.8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 14c2.2-3.2 4.8-5.2 8-5.2s5.8 2 8 5.2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="16.5" cy="7.5" r="1.4" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}
