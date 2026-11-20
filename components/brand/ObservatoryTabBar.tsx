import React, { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  ChartNoAxesCombined,
  CloudSun,
  NotebookPen,
  Sparkles,
  UsersRound,
  type LucideIcon,
} from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useTheme, layout, shadows, radii, motion, space } from '@/theme';
import { SoftPress } from '@/components/ui/SoftPress';

export const TAB_ORDER = [
  'sky',
  'chart',
  'lens',
  'bonds',
  'atelier',
] as const;

export type ObservatoryTabName = (typeof TAB_ORDER)[number];

const TAB_META: Record<
  ObservatoryTabName,
  { label: string; Icon: LucideIcon }
> = {
  sky: { label: 'Sky', Icon: CloudSun },
  chart: { label: 'Chart', Icon: ChartNoAxesCombined },
  lens: { label: 'Lens', Icon: Sparkles },
  bonds: { label: 'Bonds', Icon: UsersRound },
  atelier: { label: 'Atelier', Icon: NotebookPen },
};

function normalizeRouteName(name: string): ObservatoryTabName | null {
  const n = name.toLowerCase().replace(/^\((app)\)\//, '').replace(/^\//, '');
  if ((TAB_ORDER as readonly string[]).includes(n)) {
    return n as ObservatoryTabName;
  }
  for (const tab of TAB_ORDER) {
    if (n === tab || n.endsWith(`/${tab}`) || n.endsWith(tab)) {
      return tab;
    }
  }
  return null;
}

type MockProps = {
  activeTab: ObservatoryTabName;
  onTabPress?: (tab: ObservatoryTabName) => void;
  /** @deprecated Kept for dev-preview compatibility; tabs now use Lucide icons. */
  lensOrbWhenActive?: boolean;
  omitSafeArea?: boolean;
};

type Props = BottomTabBarProps | MockProps;

function isMock(props: Props): props is MockProps {
  return 'activeTab' in props;
}

function TabItem({
  tab,
  active,
  tint,
  onPress,
}: {
  tab: ObservatoryTabName;
  active: boolean;
  tint: string;
  onPress: () => void;
}) {
  const { colors, type, reduceMotion } = useTheme();
  const meta = TAB_META[tab];
  const Icon = meta.Icon;
  const labelStyle = type('tabLabel');
  const indicator = useSharedValue(active ? 1 : 0);

  React.useEffect(() => {
    if (reduceMotion) {
      indicator.value = active ? 1 : 0;
      return;
    }
    indicator.value = withSpring(active ? 1 : 0, {
      damping: motion.spring.damping,
      stiffness: motion.spring.stiffness,
      mass: motion.spring.mass,
    });
  }, [active, indicator, reduceMotion]);

  const bubble = useAnimatedStyle(() => ({
    opacity: reduceMotion ? (active ? 1 : 0) : indicator.value * 0.95,
    transform: [{ scale: reduceMotion ? (active ? 1 : 0) : 0.6 + indicator.value * 0.4 }],
  }));

  return (
    <SoftPress
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={meta.label}
      testID={`tab-${tab}`}
      onPress={onPress}
      style={styles.item}
    >
      <View style={styles.iconWrap}>
        <Animated.View
          style={[
            styles.activeBubble,
            { backgroundColor: colors.raised },
            bubble,
          ]}
        />
        <Icon
          size={active ? 24 : 22}
          color={tint}
          strokeWidth={active ? 2.25 : 1.75}
          absoluteStrokeWidth
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      </View>
      <Text
        style={{
          fontFamily: labelStyle.fontFamily,
          fontSize: 11,
          lineHeight: 13,
          letterSpacing: labelStyle.letterSpacing,
          color: tint,
          marginTop: 4,
          fontWeight: active ? '600' : '400',
        }}
      >
        {meta.label}
      </Text>
    </SoftPress>
  );
}

/**
 * Soft ABY-style tab bar — white chrome, soft shadow, lavender active.
 */
export function ObservatoryTabBar(props: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const activeTab: ObservatoryTabName = isMock(props)
    ? props.activeTab
    : (() => {
        const route = props.state.routes[props.state.index];
        return (
          (route ? normalizeRouteName(route.name) : null) ??
          TAB_ORDER[props.state.index] ??
          'sky'
        );
      })();

  const bottomInset =
    isMock(props) && props.omitSafeArea ? 0 : insets.bottom;

  const onPressTab = useCallback(
    (tab: ObservatoryTabName, routeKey?: string, routeName?: string) => {
      if (isMock(props)) {
        props.onTabPress?.(tab);
        return;
      }
      const event = props.navigation.emit({
        type: 'tabPress',
        target: routeKey ?? tab,
        canPreventDefault: true,
      });
      if (!event.defaultPrevented) {
        props.navigation.navigate(routeName ?? tab);
      }
    },
    [props],
  );

  return (
    <View
      style={[
        styles.dock,
        {
          height: layout.tabBarHeight + bottomInset + space.md,
          paddingBottom: bottomInset,
        },
      ]}
    >
      <View
        style={[
          styles.capsule,
          shadows.tab,
          {
            backgroundColor: colors.surfaceChrome,
            borderColor: colors.hairline,
          },
        ]}
        accessibilityRole="tablist"
      >
        {TAB_ORDER.map((tab) => {
          const active = activeTab === tab;
          const tint = active ? colors.text1 : colors.text3;

          let routeKey: string | undefined;
          let routeName: string | undefined;
          if (!isMock(props)) {
            const route = props.state.routes.find(
              (r) => normalizeRouteName(r.name) === tab,
            );
            routeKey = route?.key;
            routeName = route?.name ?? tab;
          }

          return (
            <TabItem
              key={tab}
              tab={tab}
              active={active}
              tint={tint}
              onPress={() => onPressTab(tab, routeKey, routeName)}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: space.xs,
    backgroundColor: 'transparent',
  },
  capsule: {
    height: layout.tabBarHeight,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    flexDirection: 'row',
    paddingHorizontal: space.xs,
  },
  item: {
    flex: 1,
    minWidth: layout.minHit,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 40,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBubble: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radii.pill,
    marginHorizontal: 2,
  },
});
