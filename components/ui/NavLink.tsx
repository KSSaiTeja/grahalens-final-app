import React from "react";
import {
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { ChevronRight } from "lucide-react-native";

import { fontFamilies, layout, radii, shadows, space, useTheme } from "@/theme";
import { SoftPress } from "./SoftPress";

type Props = Omit<PressableProps, "children" | "style"> & {
  label: string;
  style?: StyleProp<ViewStyle>;
};

export function NavLink({ label, style, ...pressable }: Props) {
  const { colors, type } = useTheme();
  const body = type("body");

  return (
    <SoftPress
      {...pressable}
      accessibilityRole="button"
      style={[
        styles.row,
        shadows.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.hairline,
        },
        style,
      ]}
      scale={false}
    >
      <Text
        style={{
          flex: 1,
          color: colors.text1,
          fontFamily: fontFamilies.bodyMedium,
          fontSize: body.fontSize,
          lineHeight: body.lineHeight,
        }}
      >
        {label}
      </Text>
      <ChevronRight
        size={19}
        color={colors.text2}
        strokeWidth={1.9}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    </SoftPress>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: layout.minHit + 8,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: space.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
});
