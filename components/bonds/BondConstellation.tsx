import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";

import {
  DOMAIN_LABELS,
  type BondDomainId,
  type SynastryAspect,
  type SynastryReport,
} from "@/lib/bonds";
import { space, useTheme } from "@/theme";

type Props = {
  report: SynastryReport;
  selfLabel?: string;
  otherLabel: string;
  /** Compact peek for bond home / share. */
  compact?: boolean;
  size?: number;
};

const ARC_ORDER: BondDomainId[] = [
  "talk",
  "care",
  "spark",
  "friction",
  "growth",
];

function aspectOpacity(strength: number): number {
  return 0.12 + Math.min(1, strength) * 0.28;
}

/**
 * Two foci + aspect threads + five domain arcs (BRAND Bond Constellation).
 */
export function BondConstellation({
  report,
  selfLabel = "You",
  otherLabel,
  compact = false,
  size = compact ? 200 : 280,
}: Props) {
  const { colors, type } = useTheme();
  const meta = type("meta");
  const cx = size / 2;
  const cy = size / 2;
  const left = { x: size * 0.28, y: cy };
  const right = { x: size * 0.72, y: cy };
  const r = size * 0.08;
  const threads = report.aspects.slice(0, compact ? 10 : 18);

  return (
    <View style={styles.wrap} accessibilityLabel="Bond constellation">
      <Svg width={size} height={size}>
        {threads.map((a: SynastryAspect, i) => {
          const wobble = ((i % 5) - 2) * (size * 0.012);
          return (
            <Line
              key={`${a.from}-${a.to}-${a.side}-${i}`}
              x1={left.x}
              y1={left.y + wobble}
              x2={right.x}
              y2={right.y - wobble}
              stroke={colors.text1}
              strokeOpacity={aspectOpacity(a.strength)}
              strokeWidth={1}
            />
          );
        })}
        <Circle
          cx={left.x}
          cy={left.y}
          r={r}
          fill={colors.accentSoft}
          stroke={colors.hairline}
          strokeWidth={1}
        />
        <Circle
          cx={right.x}
          cy={right.y}
          r={r}
          fill={colors.surface}
          stroke={colors.hairline}
          strokeWidth={1}
        />
        {ARC_ORDER.map((id, index) => {
          const angle = (-90 + index * 72) * (Math.PI / 180);
          const arcR = size * 0.42;
          const ax = cx + Math.cos(angle) * arcR;
          const ay = cy + Math.sin(angle) * arcR;
          const value = report.domains[id].value;
          return (
            <Circle
              key={id}
              cx={ax}
              cy={ay}
              r={4 + value * 5}
              fill={colors.accent}
              fillOpacity={0.35 + value * 0.45}
            />
          );
        })}
      </Svg>
      <View style={[styles.labels, { width: size }]} pointerEvents="none">
        <Text
          style={[
            styles.focusLabel,
            {
              left: size * 0.12,
              fontFamily: meta.fontFamily,
              color: colors.text2,
              fontSize: meta.fontSize,
            },
          ]}
        >
          {selfLabel}
        </Text>
        <Text
          style={[
            styles.focusLabel,
            {
              right: size * 0.12,
              fontFamily: meta.fontFamily,
              color: colors.text2,
              fontSize: meta.fontSize,
              textAlign: "right",
            },
          ]}
        >
          {otherLabel}
        </Text>
      </View>
      {!compact ? (
        <View style={styles.arcs} accessibilityLabel="Domain arcs">
          {ARC_ORDER.map((id) => (
            <Text
              key={id}
              style={{
                fontFamily: meta.fontFamily,
                fontSize: meta.fontSize,
                letterSpacing: meta.letterSpacing,
                color: colors.text3,
                textTransform: "uppercase",
              }}
            >
              {DOMAIN_LABELS[id]}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
  },
  labels: {
    position: "absolute",
    top: "46%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  focusLabel: {
    position: "absolute",
    width: 72,
  },
  arcs: {
    marginTop: space.sm,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: space.sm,
    paddingHorizontal: space.md,
  },
});
