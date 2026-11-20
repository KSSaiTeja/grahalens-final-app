import Svg, { Circle, Path } from 'react-native-svg';
import type { IconProps } from '../types';
import { ICON_DEFAULTS } from '../types';

export function Search({
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
      accessibilityLabel={accessibilityLabel ?? 'Search'}
    >
      <Circle cx="11" cy="11" r="5.5" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M15.5 15.5 19.5 19.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
