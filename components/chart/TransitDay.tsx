import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Icon } from "@/components/icons/Icon";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Hairline } from "@/components/ui/Hairline";
import { chartBodyIconName, chartBodyLabel } from "@/lib/chart/labels";
import { ASPECT_LABELS } from "@/lib/chart/prose";
import { RASI_LABELS, type GrahaId } from "@/lib/ephemeris/constants";
import type { NatalChart } from "@/lib/ephemeris/types";
import {
  computeTransits,
  type TransitReport,
} from "@/lib/ephemeris/transits";
import { formatDegreeInSign } from "@/lib/format/degrees";
import { useTheme, layout } from "@/theme";

type Props = {
  natal: NatalChart;
  at?: Date;
  style?: StyleProp<ViewStyle>;
};

/**
 * C5 transit choreography — real `computeTransits` day payload.
 */
export function TransitDay({ natal, at = new Date(), style }: Props) {
  const { colors, type } = useTheme();
  const meta = type("meta");
  const bodySm = type("bodySm");
  const degree = type("degree");

  const report: TransitReport = useMemo(
    () => computeTransits(natal, at),
    [natal, at],
  );

  const toNatalTop = useMemo(
    () => [...report.toNatal].sort((a, b) => b.strength - a.strength).slice(0, 12),
    [report.toNatal],
  );

  return (
    <View style={style}>
      <Text
        style={{
          fontFamily: meta.fontFamily,
          fontSize: 10,
          letterSpacing: meta.letterSpacing,
          color: colors.text3,
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        Sky now
      </Text>

      <GlassPanel padded={false} style={styles.module}>
        {report.placements.map((p, index) => (
          <React.Fragment key={p.id}>
            {index > 0 ? <Hairline /> : null}
            <View style={[styles.row, { minHeight: layout.minHit }]}>
            <Icon
              name={chartBodyIconName(p.id as GrahaId)}
              size={20}
              color={colors.text1}
              strokeWidth={1.5}
            />
            <View style={styles.copy}>
              <Text
                style={{
                  fontFamily: bodySm.fontFamily,
                  fontSize: bodySm.fontSize,
                  color: colors.text1,
                }}
              >
                {chartBodyLabel(p.id)}
                {p.retrograde ? (
                  <Text style={{ color: colors.text3 }}> Rx</Text>
                ) : null}
              </Text>
              <Text
                style={{
                  marginTop: 2,
                  fontFamily: meta.fontFamily,
                  fontSize: 10,
                  letterSpacing: meta.letterSpacing,
                  color: colors.text3,
                  textTransform: "uppercase",
                }}
              >
                {RASI_LABELS[p.sign]} · H{p.house}
                {p.vsNatalDelta != null
                  ? ` · Δ ${p.vsNatalDelta >= 0 ? "+" : ""}${p.vsNatalDelta.toFixed(1)}°`
                  : ""}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: degree.fontFamily,
                fontSize: degree.fontSize,
                color: colors.text2,
                fontVariant: degree.fontVariant,
              }}
            >
              {formatDegreeInSign(p.degreeInSign)}
            </Text>
            </View>
          </React.Fragment>
        ))}
      </GlassPanel>

      <Text
        style={{
          marginTop: 28,
          marginBottom: 10,
          fontFamily: meta.fontFamily,
          fontSize: 10,
          letterSpacing: meta.letterSpacing,
          color: colors.text3,
          textTransform: "uppercase",
        }}
      >
        Transit to natal
      </Text>

      {toNatalTop.length === 0 ? (
        <Text
          style={{
            fontFamily: bodySm.fontFamily,
            fontSize: bodySm.fontSize,
            color: colors.text2,
          }}
        >
          No transit-to-natal aspects in orb right now.
        </Text>
      ) : (
        <GlassPanel padded={false} style={styles.module}>
          {toNatalTop.map((hit, i) => (
            <React.Fragment key={`${hit.transit}-${hit.natal}-${hit.id}-${i}`}>
              {i > 0 ? <Hairline /> : null}
              <View style={[styles.row, { minHeight: layout.minHit }]}>
              <View style={styles.copy}>
                <Text
                  style={{
                    fontFamily: bodySm.fontFamily,
                    fontSize: bodySm.fontSize,
                    color: colors.text1,
                  }}
                >
                  {ASPECT_LABELS[hit.id]}
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    fontFamily: meta.fontFamily,
                    fontSize: 10,
                    letterSpacing: meta.letterSpacing,
                    color: colors.text3,
                    textTransform: "uppercase",
                  }}
                >
                  Transit {chartBodyLabel(hit.transit)} to natal{" "}
                  {chartBodyLabel(hit.natal)}
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: degree.fontFamily,
                  fontSize: degree.fontSize,
                  color: colors.text2,
                  fontVariant: degree.fontVariant,
                }}
              >
                {hit.delta.toFixed(1)}°
              </Text>
              </View>
            </React.Fragment>
          ))}
        </GlassPanel>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  module: {
    borderRadius: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  copy: {
    flex: 1,
  },
});
