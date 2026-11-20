import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { SoftPress } from "@/components/ui/SoftPress";
import type { LensStarter } from "@/lib/lens/starters";
import { radii, space, useTheme } from "@/theme";

type Props = {
  starters: LensStarter[];
  onSelect: (starter: LensStarter) => void;
  disabled?: boolean;
};

/** Compact chart-grounded starter chips for L1 empty state. */
export function StarterChips({ starters, onSelect, disabled }: Props) {
  const { colors, type } = useTheme();
  const bodySm = type("bodySm");

  return (
    <View style={styles.wrap} accessibilityRole="list">
      {starters.map((starter) => (
        <SoftPress
          key={starter.id}
          disabled={disabled}
          onPress={() => onSelect(starter)}
          accessibilityRole="button"
          accessibilityLabel={starter.label}
          style={[
            styles.chip,
            {
              backgroundColor: colors.surface,
              borderColor: colors.hairline,
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          <Text
            style={{
              fontFamily: bodySm.fontFamily,
              fontSize: bodySm.fontSize,
              lineHeight: bodySm.lineHeight,
              color: colors.text1,
            }}
          >
            {starter.label}
          </Text>
        </SoftPress>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    justifyContent: "center",
  },
  chip: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
    justifyContent: "center",
  },
});
