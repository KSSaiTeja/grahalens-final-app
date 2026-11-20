import Svg, { Circle, Path } from 'react-native-svg';
import type { IconProps } from '../types';
import { ICON_DEFAULTS } from '../types';

/** Geometric care — overlapping nodes + cross, not a heart. */
export function Care({
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
      accessibilityLabel={accessibilityLabel ?? 'Care'}
    >
      <Circle cx="9" cy="11" r="3.2" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="15" cy="11" r="3.2" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M12 8.5v7M9.5 14.5h5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
