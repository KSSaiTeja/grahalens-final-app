import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { SoftPress } from "@/components/ui/SoftPress";
import {
  JOURNAL_MOOD_LABELS,
  JOURNAL_MOODS,
  type JournalMood,
} from "@/lib/atelier";
import { radii, space, useTheme } from "@/theme";

type Props = {
  value: JournalMood | null;
  onChange: (mood: JournalMood) => void;
  label?: string;
};

/** Mood chips — Observatory vocabulary, no emoji. */
export function MoodPicker({ value, onChange, label = "How it feels" }: Props) {
  const { colors, type } = useTheme();
  const meta = type("meta");
  const bodySm = type("bodySm");

  return (
    <View>
      <Text
        style={{
          fontFamily: meta.fontFamily,
          fontSize: 10,
          letterSpacing: meta.letterSpacing,
          color: colors.text3,
          textTransform: "uppercase",
          marginBottom: space.sm,
        }}
      >
        {label}
      </Text>
      <View style={styles.row}>
        {JOURNAL_MOODS.map((mood) => {
          const selected = value === mood;
          return (
            <SoftPress
              key={mood}
              onPress={() => onChange(mood)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={JOURNAL_MOOD_LABELS[mood]}
              style={[
                styles.chip,
                {
                  backgroundColor: selected
                    ? colors.accentSoft
                    : "rgba(255,255,255,0.45)",
                  borderColor: selected ? colors.accent : colors.hairline,
                },
              ]}
            >
              <Text
                style={{
                  fontFamily: bodySm.fontFamily,
                  fontSize: bodySm.fontSize,
                  color: colors.text1,
                }}
              >
                {JOURNAL_MOOD_LABELS[mood]}
              </Text>
            </SoftPress>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
  },
  chip: {
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    minHeight: 40,
    justifyContent: "center",
  },
});
