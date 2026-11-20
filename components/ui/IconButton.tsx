import React from "react";
import { StyleSheet, type PressableProps, type ViewStyle } from "react-native";
import type { LucideIcon } from "lucide-react-native";

import { layout, radii, useTheme } from "@/theme";
import { SoftPress } from "./SoftPress";

type Props = Omit<PressableProps, "children" | "style"> & {
  icon: LucideIcon;
  label: string;
  size?: number;
  selected?: boolean;
  style?: ViewStyle;
};

export function IconButton({
  icon: Glyph,
  label,
  size = 22,
  selected = false,
  style,
  ...pressable
}: Props) {
  const { colors } = useTheme();

  return (
    <SoftPress
      {...pressable}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled: !!pressable.disabled }}
      style={[
        styles.hit,
        {
          backgroundColor: selected ? colors.accentSoft : colors.surface,
          borderColor: selected ? colors.accent : colors.hairline,
        },
        style,
      ]}
    >
      <Glyph
        size={size}
        color={selected ? colors.accent : colors.text1}
        strokeWidth={selected ? 2.1 : 1.75}
      />
    </SoftPress>
  );
}

const styles = StyleSheet.create({
  hit: {
    width: layout.minHit,
    height: layout.minHit,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
});
