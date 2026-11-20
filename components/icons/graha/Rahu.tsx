import Svg, { Circle, Path } from 'react-native-svg';
import type { IconProps } from '../types';
import { ICON_DEFAULTS } from '../types';

export function Rahu({
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
      accessibilityLabel={accessibilityLabel ?? 'Rahu'}
    >
      <Path
        d="M6 16.5c0-4.2 2.7-7.5 6-7.5s6 3.3 6 7.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Circle cx="9.2" cy="12.2" r="1.3" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="14.8" cy="12.2" r="1.3" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M9.5 16.8c.8.8 1.6 1.2 2.5 1.2s1.7-.4 2.5-1.2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M12 5.5v3.2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
