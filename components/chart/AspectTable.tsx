import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Hairline } from "@/components/ui/Hairline";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { SoftPress } from "@/components/ui/SoftPress";
import { chartBodyLabel, type ChartBodyId } from "@/lib/chart";
import {
  ASPECT_LABELS,
  aspectRowLabel,
} from "@/lib/chart/prose";
import {
  natalAspects,
  type AspectHit,
} from "@/lib/ephemeris/aspects";
import type { NatalChart } from "@/lib/ephemeris/types";
import { useTheme, layout } from "@/theme";

type Props = {
  chart: NatalChart;
  /** Optional filter to one body (planet page). */
  focusId?: ChartBodyId | null;
  onSelect?: (hit: AspectHit) => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * C6 natal aspect table — real `natalAspects` payload only.
 */
export function AspectTable({
  chart,
  focusId = null,
  onSelect,
  style,
}: Props) {
  const { colors, type } = useTheme();
  const meta = type("meta");
  const bodySm = type("bodySm");
  const degree = type("degree");

  const rows = useMemo(() => {
    const all = natalAspects(chart);
    if (!focusId) return all;
    return all.filter((a) => a.a === focusId || a.b === focusId);
  }, [chart, focusId]);

  if (rows.length === 0) {
    return (
      <View style={style}>
        <Text
          style={{
            fontFamily: bodySm.fontFamily,
            fontSize: bodySm.fontSize,
            color: colors.text2,
          }}
        >
          No major aspects in orb for this chart.
        </Text>
      </View>
    );
  }

  return (
    <GlassPanel padded={false} style={[styles.panel, style]}>
      <View accessibilityRole="list" accessibilityLabel="Natal aspects">
      <View style={styles.head}>
        <Text style={[styles.headCell, headMeta(meta, colors), { flex: 1.4 }]}>
          Aspect
        </Text>
        <Text style={[styles.headCell, headMeta(meta, colors), { flex: 1 }]}>
          Bodies
        </Text>
        <Text
          style={[
            styles.headCell,
            headMeta(meta, colors),
            { width: 56, textAlign: "right" },
          ]}
        >
          Orb
        </Text>
      </View>
      <Hairline />
      {rows.map((hit, i) => {
        const label = aspectRowLabel(hit);
        return (
          <React.Fragment key={`${hit.a}-${hit.b}-${hit.id}`}>
            {i > 0 ? <Hairline /> : null}
            <SoftPress
              scale={false}
              onPress={onSelect ? () => onSelect(hit) : undefined}
              accessibilityRole="button"
              accessibilityLabel={`${label}, orb ${hit.delta.toFixed(1)} degrees`}
              style={[styles.row, { minHeight: layout.minHit }]}
            >
              <Text
                style={{
                  flex: 1.4,
                  fontFamily: bodySm.fontFamily,
                  fontSize: bodySm.fontSize,
                  color: colors.text1,
                }}
              >
                {ASPECT_LABELS[hit.id]}
              </Text>
              <Text
                style={{
                  flex: 1,
                  fontFamily: bodySm.fontFamily,
                  fontSize: bodySm.fontSize,
                  color: colors.text2,
                }}
              >
                {chartBodyLabel(hit.a as ChartBodyId)}–
                {chartBodyLabel(hit.b as ChartBodyId)}
              </Text>
              <Text
                style={{
                  width: 56,
                  textAlign: "right",
                  fontFamily: degree.fontFamily,
                  fontSize: degree.fontSize,
                  color: colors.text2,
                  fontVariant: degree.fontVariant,
                }}
              >
                {hit.delta.toFixed(1)}°
              </Text>
            </SoftPress>
          </React.Fragment>
        );
      })}
      </View>
    </GlassPanel>
  );
}

function headMeta(
  meta: { fontFamily: string; letterSpacing?: number },
  colors: { text3: string },
) {
  return {
    fontFamily: meta.fontFamily,
    fontSize: 10,
    letterSpacing: meta.letterSpacing,
    color: colors.text3,
    textTransform: "uppercase" as const,
  };
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 24,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8,
    paddingTop: 16,
    paddingHorizontal: 16,
    gap: 8,
  },
  headCell: {},
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
});
