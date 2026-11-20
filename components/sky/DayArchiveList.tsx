import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";

import { LockGlyph } from "@/components/billing/LockGlyph";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { SoftPress } from "@/components/ui/SoftPress";
import { Hairline } from "@/components/ui/Hairline";
import { formatCivilLabel } from "@/lib/sky/archive";
import { useTheme, radii } from "@/theme";

export type ArchiveDayRow = {
  date: string;
  unlocked: boolean;
  /** Optional weather dominant label. */
  dominantLabel?: string;
};

type Props = {
  days: ArchiveDayRow[];
  tz: string;
  selectedDate?: string;
  onSelectUnlocked: (date: string) => void;
  /** Locked rows open the shared paywall sheet. */
  onLockedPress: () => void;
};

/**
 * 7-day free preview list — older rows gated with LockGlyph (S4).
 */
export function DayArchiveList({
  days,
  tz,
  selectedDate,
  onSelectUnlocked,
  onLockedPress,
}: Props) {
  const { colors, type } = useTheme();
  const meta = type("meta");
  const body = type("body");

  return (
    <View>
      <Text
        style={{
          fontFamily: meta.fontFamily,
          fontSize: 10,
          letterSpacing: meta.letterSpacing,
          color: colors.text3,
          textTransform: "uppercase",
          marginBottom: 8,
          paddingHorizontal: 4,
        }}
      >
        Past days · 7 free
      </Text>
      <GlassPanel padded={false} style={styles.panel}>
      {days.map((d, i) => {
        const selected = d.date === selectedDate;
        const label = formatCivilLabel(d.date, tz);
        const row = (
          <View
            style={[
              styles.row,
              selected && { backgroundColor: colors.accentSoft },
            ]}
          >
            <View style={styles.copy}>
              <Text
                style={{
                  fontFamily: body.fontFamily,
                  fontSize: 15,
                  color: d.unlocked ? colors.text1 : colors.text3,
                }}
              >
                {label}
              </Text>
              {d.dominantLabel ? (
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
                  {d.dominantLabel}
                </Text>
              ) : null}
            </View>
            {d.unlocked ? (
              <ChevronRight size={18} color={colors.text3} strokeWidth={1.8} />
            ) : (
              <LockGlyph size={14} accessibilityLabel="Opens with Private" />
            )}
          </View>
        );

        return (
          <View key={d.date}>
            {d.unlocked ? (
              <SoftPress
                onPress={() => onSelectUnlocked(d.date)}
                accessibilityRole="button"
                accessibilityLabel={`Archive ${label}`}
                scale={false}
              >
                {row}
              </SoftPress>
            ) : (
              <SoftPress
                onPress={onLockedPress}
                accessibilityRole="button"
                accessibilityLabel={`Locked archive ${label}. Opens with Private.`}
                scale={false}
              >
                {row}
              </SoftPress>
            )}
            {i < days.length - 1 ? <Hairline /> : null}
          </View>
        );
      })}
      </GlassPanel>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: radii.xl,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 56,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radii.sm,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
});
