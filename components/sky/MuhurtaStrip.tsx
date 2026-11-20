import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { SoftPress } from "@/components/ui/SoftPress";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  formatMuhurtaWindow,
  KIND_LABELS,
} from "@/lib/sky/format";
import type { MuhurtaMoment } from "@/lib/sky/muhurta-moments";
import { useTheme, radii, space } from "@/theme";

type Props = {
  moments: MuhurtaMoment[];
  tz: string;
  onSelect: (id: string) => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Horizontal muhurta strip — S1 (BRAND §07). Orange accent dots lead chips.
 */
export function MuhurtaStrip({ moments, tz, onSelect, style }: Props) {
  const { colors, type } = useTheme();
  const meta = type("meta");
  const bodySm = type("bodySm");

  const ranked = [...moments].sort((a, b) => b.score - a.score).slice(0, 6);

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
          paddingHorizontal: 4,
        }}
      >
        Muhurta
      </Text>
      {ranked.length === 0 ? (
        <Text
          style={{
            fontFamily: bodySm.fontFamily,
            fontSize: bodySm.fontSize,
            color: colors.text2,
            paddingHorizontal: 4,
          }}
        >
          No windows scored for this civil day.
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {ranked.map((m) => (
            <SoftPress
              key={m.id}
              onPress={() => onSelect(m.id)}
              accessibilityRole="button"
              accessibilityLabel={`${KIND_LABELS[m.kind]} ${formatMuhurtaWindow(m, tz)}`}
              style={styles.chipPress}
            >
              <GlassPanel floating padded={false} style={styles.chip}>
                <View style={[styles.dot, { backgroundColor: colors.accent }]} />
                <Text
                  style={{
                    fontFamily: meta.fontFamily,
                    fontSize: 10,
                    letterSpacing: meta.letterSpacing,
                    color: colors.accent,
                    textTransform: "uppercase",
                  }}
                >
                  {KIND_LABELS[m.kind]}
                </Text>
                <Text
                  style={{
                    marginTop: 6,
                    fontFamily: bodySm.fontFamily,
                    fontSize: 13,
                    color: colors.text1,
                  }}
                >
                  {formatMuhurtaWindow(m, tz)}
                </Text>
                <Text
                  style={{
                    marginTop: 4,
                    fontFamily: meta.fontFamily,
                    fontSize: 10,
                    color: colors.text3,
                  }}
                >
                  {(m.score * 100).toFixed(0)}%
                </Text>
              </GlassPanel>
            </SoftPress>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: space.sm,
    paddingRight: 8,
  },
  chipPress: {
    minWidth: 124,
  },
  chip: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    minHeight: 104,
    borderRadius: radii.lg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
});
