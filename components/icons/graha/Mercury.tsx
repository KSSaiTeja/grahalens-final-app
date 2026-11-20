import Svg, { Circle, Path } from 'react-native-svg';
import type { IconProps } from '../types';
import { ICON_DEFAULTS } from '../types';

export function Mercury({
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
      accessibilityLabel={accessibilityLabel ?? 'Mercury'}
    >
      <Circle cx="12" cy="11" r="3.4" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M12 14.4v4.2M9.6 16.5h4.8M9.2 5.2c.9-1.1 2-1.7 2.8-1.7s1.9.6 2.8 1.7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
