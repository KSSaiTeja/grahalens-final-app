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
import { SoftPress } from "@/components/ui/SoftPress";
import {
  antarPeriodsForMaha,
  dashaCaret,
  mahaPeriods,
} from "@/lib/chart/dasha-ribbon";
import { chartBodyIconName, chartBodyLabel } from "@/lib/chart/labels";
import {
  dashaPeriodProse,
  formatPeriodRange,
} from "@/lib/chart/prose";
import type { DashaTimeline } from "@/lib/ephemeris/dasha";
import type { GrahaId } from "@/lib/ephemeris/constants";
import { useTheme, radii } from "@/theme";

type Props = {
  timeline: DashaTimeline;
  at?: Date;
  /** Optional: open deep read (C4 — Prompt 16). */
  onSelectPeriod?: (key: string) => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * C3 Dasha Ribbon — proportional maha segments + caret matching compute.
 */
export function DashaRibbon({
  timeline,
  at = new Date(),
  onSelectPeriod,
  style,
}: Props) {
  const { colors, type } = useTheme();
  const meta = type("meta");
  const body = type("body");
  const bodySm = type("bodySm");
  const title = type("title");
  const degree = type("degree");

  const mahas = useMemo(() => mahaPeriods(timeline), [timeline]);
  const caret = useMemo(() => dashaCaret(timeline, at), [timeline, at]);
  const antars = useMemo(
    () => antarPeriodsForMaha(timeline, caret.maha),
    [timeline, caret.maha],
  );

  const totalMs = useMemo(() => {
    const start = Date.parse(mahas[0]!.start);
    const end = Date.parse(mahas[mahas.length - 1]!.end);
    return Math.max(1, end - start);
  }, [mahas]);

  const prose = useMemo(
    () =>
      dashaPeriodProse({
        maha: caret.maha,
        antar: caret.antar,
        at: caret.at,
      }),
    [caret],
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
          marginBottom: 12,
        }}
      >
        Dasha ribbon
      </Text>

      <View
        style={[styles.track, { backgroundColor: colors.hairline }]}
        accessibilityRole="summary"
        accessibilityLabel={`Dasha caret at ${(caret.fraction * 100).toFixed(0)} percent. Current ${chartBodyLabel(caret.maha.lord)} mahadasha, ${chartBodyLabel(caret.antar.lord)} antardasha`}
      >
        {mahas.map((m) => {
          const width =
            ((Date.parse(m.end) - Date.parse(m.start)) / totalMs) * 100;
          const active = m.key === caret.maha.key;
          const segStyle = [
            styles.seg,
            {
              width: `${width}%` as `${number}%`,
              backgroundColor: active
                ? colors.accentSoft
                : colors.surface,
              borderColor: active ? colors.accent : colors.hairlineStrong,
            },
          ];
          const icon = (
            <Icon
              name={chartBodyIconName(m.lord as GrahaId)}
              size={14}
              color={active ? colors.accent : colors.text2}
              strokeWidth={1.5}
            />
          );
          if (!onSelectPeriod) {
            return (
              <View
                key={m.key}
                accessibilityLabel={`${chartBodyLabel(m.lord)} mahadasha${active ? ", current" : ""}`}
                accessibilityState={{ selected: active }}
                style={segStyle}
              >
                {icon}
              </View>
            );
          }
          return (
            <SoftPress
              key={m.key}
              scale={false}
              onPress={() => onSelectPeriod(m.key)}
              accessibilityRole="button"
              accessibilityLabel={`${chartBodyLabel(m.lord)} mahadasha${active ? ", current" : ""}`}
              accessibilityState={{ selected: active }}
              style={segStyle}
            >
              {icon}
            </SoftPress>
          );
        })}

        {/* Caret — left% matches dashaCaret.fraction */}
        <View
          pointerEvents="none"
          style={[
            styles.caret,
            {
              left: `${caret.fraction * 100}%`,
              borderTopColor: colors.accent,
            },
          ]}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      </View>

      <GlassPanel floating style={styles.nowBlock}>
        <Text
          style={{
            fontFamily: title.fontFamily,
            fontSize: 22,
            lineHeight: 28,
            color: colors.text1,
          }}
        >
          {chartBodyLabel(caret.maha.lord)}
          <Text style={{ color: colors.text3, fontSize: 18 }}> / </Text>
          {chartBodyLabel(caret.antar.lord)}
        </Text>
        <Text
          style={{
            marginTop: 6,
            fontFamily: degree.fontFamily,
            fontSize: degree.fontSize,
            color: colors.text2,
            fontVariant: degree.fontVariant,
          }}
        >
          {formatPeriodRange(caret.antar)}
        </Text>
        <Text
          style={{
            marginTop: 14,
            fontFamily: body.fontFamily,
            fontSize: body.fontSize,
            lineHeight: body.lineHeight,
            color: colors.text1,
          }}
        >
          {prose}
        </Text>
      </GlassPanel>

      <Text
        style={{
          marginTop: 28,
          marginBottom: 8,
          fontFamily: meta.fontFamily,
          fontSize: 10,
          letterSpacing: meta.letterSpacing,
          color: colors.text3,
          textTransform: "uppercase",
        }}
      >
        Antardasha in {chartBodyLabel(caret.maha.lord)}
      </Text>

      <GlassPanel padded={false} style={styles.antarPanel}>
      {antars.map((a) => {
        const active = a.key === caret.antar.key;
        const row = (
          <>
            <Text
              style={{
                flex: 1,
                fontFamily: bodySm.fontFamily,
                fontSize: bodySm.fontSize,
                color: colors.text1,
              }}
            >
              {chartBodyLabel(a.lord)}
            </Text>
            <Text
              style={{
                fontFamily: degree.fontFamily,
                fontSize: 11,
                color: colors.text3,
                fontVariant: degree.fontVariant,
              }}
            >
              {formatPeriodRange(a)}
            </Text>
          </>
        );
        const rowStyle = [
          styles.antarRow,
          {
            backgroundColor: active ? colors.accentSoft : "transparent",
          },
        ];
        if (!onSelectPeriod) {
          return (
            <View
              key={a.key}
              accessibilityState={{ selected: active }}
              style={rowStyle}
            >
              {row}
            </View>
          );
        }
        return (
          <SoftPress
            key={a.key}
            scale={false}
            onPress={() => onSelectPeriod(a.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={rowStyle}
          >
            {row}
          </SoftPress>
        );
      })}
      </GlassPanel>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    height: 44,
    borderRadius: radii.md,
    overflow: "visible",
    position: "relative",
  },
  seg: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  caret: {
    position: "absolute",
    top: -6,
    marginLeft: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  nowBlock: {
    marginTop: 20,
    borderRadius: 24,
  },
  antarPanel: {
    borderRadius: 24,
  },
  antarRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
  },
});
