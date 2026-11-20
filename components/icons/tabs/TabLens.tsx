import Svg, { Circle, Line } from 'react-native-svg';
import type { IconProps } from '../types';
import { ICON_DEFAULTS } from '../types';

export function TabLens({
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
      accessibilityLabel={accessibilityLabel ?? 'Lens'}
    >
      <Circle cx="12" cy="12" r="7.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Circle cx="12" cy="12" r="3.2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="12" y1="5.5" x2="12" y2="8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="12" y1="16" x2="12" y2="18.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="5.5" y1="12" x2="8" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="16" y1="12" x2="18.5" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}
