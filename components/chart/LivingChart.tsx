import React, { useEffect, useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  Line,
  Path,
  Skia,
  vec,
} from '@shopify/react-native-skia';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '@/components/icons/Icon';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { natalAspects } from '@/lib/ephemeris/aspects';
import {
  CHART_BODY_ORDER,
  chartBodyIconName,
  chartBodyLabel,
  chartDiameter,
  chartLayoutMetrics,
  lagnaSignCusp,
  lonToPoint,
  lonToUnit,
  type ChartBodyId,
} from '@/lib/chart';
import type { NatalChart } from '@/lib/ephemeris/types';
import { getPlacement } from '@/lib/ephemeris/types';
import { layout, useTheme } from '@/theme';

type Props = {
  chart: NatalChart;
  selectedId?: ChartBodyId | null;
  onSelect?: (id: ChartBodyId) => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Skia Living Chart — BRAND §07 / PRD F2.
 * Wheel is decorative when PlacementList is present; planets remain tappable.
 * Reduced motion: final frame immediately (no chart-in).
 */
export function LivingChart({
  chart,
  selectedId = null,
  onSelect,
  style,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const { colors, reduceMotion, motion, type } = useTheme();
  const size = chartDiameter(screenWidth);
  const metrics = useMemo(() => chartLayoutMetrics(size, chart), [size, chart]);
  const aspects = useMemo(() => natalAspects(chart), [chart]);
  const meta = type('meta');

  const strokeEnd = useSharedValue(reduceMotion ? 1 : 0);
  const fade = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      strokeEnd.value = 1;
      fade.value = 1;
      return;
    }
    strokeEnd.value = 0;
    fade.value = 0;
    strokeEnd.value = withTiming(1, {
      duration: motion.chartIn.strokeMs,
      easing: Easing.out(Easing.cubic),
    });
    fade.value = withDelay(
      motion.chartIn.strokeMs * 0.35,
      withTiming(1, {
        duration: motion.chartIn.fadeMs,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [chart.birthAt, reduceMotion, motion, strokeEnd, fade]);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
  }));

  const ringPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(metrics.cx, metrics.cy, metrics.outerR);
    return p;
  }, [metrics]);

  const signTicks = useMemo(() => {
    const cusp = lagnaSignCusp(metrics.lagnaLon);
    const ticks: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    for (let i = 0; i < 12; i++) {
      const lon = cusp + i * 30;
      const { ux, uy } = lonToUnit(lon, metrics.lagnaLon);
      ticks.push({
        x1: metrics.cx + ux * metrics.signR,
        y1: metrics.cy + uy * metrics.signR,
        x2: metrics.cx + ux * metrics.outerR,
        y2: metrics.cy + uy * metrics.outerR,
      });
    }
    return ticks;
  }, [metrics]);

  const houseLabels = useMemo(() => {
    const cusp = lagnaSignCusp(metrics.lagnaLon);
    return Array.from({ length: 12 }, (_, i) => {
      const midLon = cusp + i * 30 + 15;
      const pt = lonToPoint(
        midLon,
        metrics.lagnaLon,
        metrics.cx,
        metrics.cy,
        metrics.houseR,
      );
      return { house: i + 1, ...pt };
    });
  }, [metrics]);

  const planetNodes = useMemo(() => {
    return CHART_BODY_ORDER.map((id) => {
      const p = getPlacement(chart, id);
      const pt = lonToPoint(
        p.longitude,
        metrics.lagnaLon,
        metrics.cx,
        metrics.cy,
        metrics.planetR,
      );
      return { id, placement: p, ...pt };
    });
  }, [chart, metrics]);

  const ivory = colors.text1;
  const accent = colors.accent;

  return (
    <GlassPanel
      padded={false}
      floating
      style={[styles.chartCard, { width: size, height: size, alignSelf: 'center' }, style]}
    >
      <View style={{ width: size, height: size }}>
      <View
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
      <Canvas style={{ width: size, height: size }}>
        <Path
          path={ringPath}
          style="stroke"
          strokeWidth={1}
          color={ivory}
          opacity={0.35}
          start={0}
          end={strokeEnd}
        />
        <Circle
          cx={metrics.cx}
          cy={metrics.cy}
          r={metrics.houseR}
          style="stroke"
          strokeWidth={StyleSheet.hairlineWidth}
          color={ivory}
          opacity={0.18}
        />
        <Group opacity={fade}>
          {signTicks.map((t, i) => (
            <Line
              key={`tick-${i}`}
              p1={vec(t.x1, t.y1)}
              p2={vec(t.x2, t.y2)}
              color={ivory}
              strokeWidth={1}
              opacity={0.35}
            />
          ))}
          {aspects.map((a) => {
            const pa = getPlacement(chart, a.a);
            const pb = getPlacement(chart, a.b);
            const aPt = lonToPoint(
              pa.longitude,
              metrics.lagnaLon,
              metrics.cx,
              metrics.cy,
              metrics.planetR,
            );
            const bPt = lonToPoint(
              pb.longitude,
              metrics.lagnaLon,
              metrics.cx,
              metrics.cy,
              metrics.planetR,
            );
            const highlighted =
              selectedId != null &&
              (a.a === selectedId || a.b === selectedId);
            return (
              <Line
                key={`${a.a}-${a.b}-${a.id}`}
                p1={vec(aPt.x, aPt.y)}
                p2={vec(bPt.x, bPt.y)}
                color={ivory}
                strokeWidth={highlighted ? 1.25 : 1}
                opacity={highlighted ? 0.35 : 0.08}
              />
            );
          })}
        </Group>
      </Canvas>
      </View>

      <Animated.View
        pointerEvents="box-none"
        style={[StyleSheet.absoluteFill, fadeStyle]}
      >
        {houseLabels.map((h) => (
          <Text
            key={`h-${h.house}`}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: h.x - 8,
              top: h.y - 7,
              width: 16,
              textAlign: 'center',
              fontFamily: meta.fontFamily,
              fontSize: 10,
              letterSpacing: meta.letterSpacing,
              color: colors.text3,
            }}
          >
            {h.house}
          </Text>
        ))}

        {planetNodes.map((node) => {
          const selected = selectedId === node.id;
          const hit = layout.minHit;
          return (
            <Pressable
              key={node.id}
              onPress={() => onSelect?.(node.id)}
              accessibilityRole="button"
              accessibilityLabel={`${chartBodyLabel(node.id)}, house ${node.placement.house}`}
              accessibilityState={{ selected }}
              hitSlop={4}
              style={{
                position: 'absolute',
                left: node.x - hit / 2,
                top: node.y - hit / 2,
                width: hit,
                height: hit,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={[
                  styles.planetDot,
                  {
                    backgroundColor: colors.void,
                    borderColor: selected ? accent : colors.hairlineStrong,
                  },
                ]}
              >
                <Icon
                  name={chartBodyIconName(node.id)}
                  size={16}
                  color={selected ? accent : colors.text1}
                  strokeWidth={1.5}
                />
              </View>
            </Pressable>
          );
        })}
      </Animated.View>
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  chartCard: {
    borderRadius: 32,
  },
  planetDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
