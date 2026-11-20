import Svg, { Circle, Path } from 'react-native-svg';
import type { IconProps } from '../types';
import { ICON_DEFAULTS } from '../types';

export function Share({
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
      accessibilityLabel={accessibilityLabel ?? 'Share'}
    >
      <Circle cx="7" cy="12" r="2.2" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="17" cy="7" r="2.2" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="17" cy="17" r="2.2" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M9 11.2 15 8.2M9 12.8l6 3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
