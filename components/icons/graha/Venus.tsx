import Svg, { Circle, Path } from 'react-native-svg';
import type { IconProps } from '../types';
import { ICON_DEFAULTS } from '../types';

export function Venus({
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
      accessibilityLabel={accessibilityLabel ?? 'Venus'}
    >
      <Circle cx="12" cy="9.5" r="4" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M12 13.5v6M9.4 16.8h5.2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
