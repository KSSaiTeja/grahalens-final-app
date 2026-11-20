import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { SoftPress } from "@/components/ui/SoftPress";
import {
  JOURNAL_MOOD_LABELS,
  type JournalRecord,
} from "@/lib/atelier";
import { radii, space, useTheme } from "@/theme";

type Props = {
  entry: JournalRecord;
  onPress: () => void;
};

function previewBody(body: string): string {
  const trimmed = body.trim().replace(/\s+/g, " ");
  if (trimmed.length <= 110) return trimmed;
  return `${trimmed.slice(0, 107)}…`;
}

function formatDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function JournalEntryRow({ entry, onPress }: Props) {
  const { colors, type } = useTheme();
  const body = type("body");
  const meta = type("meta");
  const moodLabel = entry.mood ? JOURNAL_MOOD_LABELS[entry.mood] : null;
  const weather = entry.weatherSnapshot?.dominant;

  return (
    <SoftPress
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Journal entry from ${formatDay(entry.createdAt)}`}
      style={[
        styles.row,
        {
          backgroundColor: "rgba(255,255,255,0.55)",
          borderColor: colors.hairline,
        },
      ]}
    >
      <View style={styles.metaRow}>
        <Text
          style={{
            fontFamily: meta.fontFamily,
            fontSize: meta.fontSize,
            letterSpacing: meta.letterSpacing,
            color: colors.text3,
            textTransform: "uppercase",
          }}
        >
          {formatDay(entry.createdAt)}
          {moodLabel ? ` · ${moodLabel}` : ""}
          {weather ? ` · ${weather}` : ""}
        </Text>
      </View>
      <Text
        style={{
          marginTop: 8,
          fontFamily: body.fontFamily,
          fontSize: body.fontSize,
          lineHeight: body.lineHeight,
          color: colors.text1,
        }}
      >
        {previewBody(entry.body)}
      </Text>
    </SoftPress>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.md,
    minHeight: 88,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
