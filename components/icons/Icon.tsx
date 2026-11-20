import React from 'react';
import { View } from 'react-native';

import type { IconComponent, IconProps } from './types';
import { ICON_DEFAULTS } from './types';

import { TabSky } from './tabs/TabSky';
import { TabChart } from './tabs/TabChart';
import { TabLens } from './tabs/TabLens';
import { TabBonds } from './tabs/TabBonds';
import { TabAtelier } from './tabs/TabAtelier';

import { Sun } from './graha/Sun';
import { Moon } from './graha/Moon';
import { Mercury } from './graha/Mercury';
import { Venus } from './graha/Venus';
import { Mars } from './graha/Mars';
import { Jupiter } from './graha/Jupiter';
import { Saturn } from './graha/Saturn';
import { Rahu } from './graha/Rahu';
import { Ketu } from './graha/Ketu';
import { Lagna } from './graha/Lagna';

import { Back } from './system/Back';
import { Close } from './system/Close';
import { Settings } from './system/Settings';
import { Lock } from './system/Lock';
import { Unlock } from './system/Unlock';
import { Share } from './system/Share';
import { Edit } from './system/Edit';
import { Trash } from './system/Trash';
import { ChevronRight } from './system/ChevronRight';
import { ChevronDown } from './system/ChevronDown';
import { Search } from './system/Search';
import { Check } from './system/Check';
import { Alert } from './system/Alert';
import { Offline } from './system/Offline';
import { Restore } from './system/Restore';
import { Spark as SystemSpark } from './system/Spark';

import { Talk } from './domains/Talk';
import { Care } from './domains/Care';
import { Spark as DomainSpark } from './domains/Spark';
import { Friction as DomainFriction } from './domains/Friction';
import { Growth } from './domains/Growth';

import { Clarity } from './weather/Clarity';
import { Pressure } from './weather/Pressure';
import { Friction as WeatherFriction } from './weather/Friction';
import { Opening } from './weather/Opening';

import { useTheme } from '@/theme';

export const iconRegistry = {
  // tabs
  'tab.sky': TabSky,
  'tab.chart': TabChart,
  'tab.lens': TabLens,
  'tab.bonds': TabBonds,
  'tab.atelier': TabAtelier,
  // graha
  'graha.sun': Sun,
  'graha.moon': Moon,
  'graha.mercury': Mercury,
  'graha.venus': Venus,
  'graha.mars': Mars,
  'graha.jupiter': Jupiter,
  'graha.saturn': Saturn,
  'graha.rahu': Rahu,
  'graha.ketu': Ketu,
  'graha.lagna': Lagna,
  // system
  'system.back': Back,
  'system.close': Close,
  'system.settings': Settings,
  'system.lock': Lock,
  'system.unlock': Unlock,
  'system.share': Share,
  'system.edit': Edit,
  'system.trash': Trash,
  'system.chevron-right': ChevronRight,
  'system.chevron-down': ChevronDown,
  'system.search': Search,
  'system.check': Check,
  'system.alert': Alert,
  'system.offline': Offline,
  'system.restore': Restore,
  'system.spark': SystemSpark,
  // domains
  'domain.talk': Talk,
  'domain.care': Care,
  'domain.spark': DomainSpark,
  'domain.friction': DomainFriction,
  'domain.growth': Growth,
  // weather
  'weather.clarity': Clarity,
  'weather.pressure': Pressure,
  'weather.friction': WeatherFriction,
  'weather.opening': Opening,
} as const satisfies Record<string, IconComponent>;

export type IconName = keyof typeof iconRegistry;

export type IconElementProps = IconProps & {
  name?: IconName;
  /** Direct component override — when set, `name` is ignored */
  component?: IconComponent;
};

export function Icon({
  name,
  component,
  size = ICON_DEFAULTS.size,
  color,
  strokeWidth = ICON_DEFAULTS.strokeWidth,
  accessibilityLabel,
}: IconElementProps) {
  const { colors } = useTheme();
  const Comp = component ?? (name ? iconRegistry[name] : undefined);
  if (!Comp) {
    throw new Error('Icon requires `name` or `component`');
  }

  const isLabeled = Boolean(accessibilityLabel);

  return (
    <View
      accessible={isLabeled}
      accessibilityRole={isLabeled ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityElementsHidden={!isLabeled}
      importantForAccessibility={isLabeled ? 'yes' : 'no-hide-descendants'}
      pointerEvents="none"
      style={{ width: size, height: size }}
    >
      <Comp
        size={size}
        color={color ?? colors.text1}
        strokeWidth={strokeWidth}
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );
}

/** Flat list for /dev/system icon sheet */
export const ALL_ICON_NAMES = Object.keys(iconRegistry) as IconName[];

export {
  TabSky,
  TabChart,
  TabLens,
  TabBonds,
  TabAtelier,
  Sun,
  Moon,
  Mercury,
  Venus,
  Mars,
  Jupiter,
  Saturn,
  Rahu,
  Ketu,
  Lagna,
  Back,
  Close,
  Settings,
  Lock,
  Unlock,
  Share,
  Edit,
  Trash,
  ChevronRight,
  ChevronDown,
  Search,
  Check,
  Alert,
  Offline,
  Restore,
  Talk,
  Care,
  Growth,
  Clarity,
  Pressure,
  Opening,
};
