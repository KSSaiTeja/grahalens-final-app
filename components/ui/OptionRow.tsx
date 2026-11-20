import React from "react";
import { StyleSheet, Text, View, type PressableProps } from "react-native";
import { Check } from "lucide-react-native";

import { fontFamilies, layout, radii, space, shadows, useTheme } from "@/theme";
import { SoftPress } from "./SoftPress";

type Props = Omit<PressableProps, "children"> & {
  label: string;
  detail?: string;
  selected?: boolean;
};

export function OptionRow({
  label,
  detail,
  selected = false,
  ...pressable
}: Props) {
  const { colors, type } = useTheme();
  const body = type("body");
  const bodySm = type("bodySm");

  return (
    <SoftPress
      {...pressable}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled: !!pressable.disabled }}
      style={[
        styles.row,
        shadows.card,
        {
          backgroundColor: selected ? colors.accentSoft : colors.surface,
          borderColor: selected ? colors.accent : colors.hairline,
        },
      ]}
    >
      <View style={styles.copy}>
        <Text
          style={{
            color: colors.text1,
            fontFamily: fontFamilies.bodyMedium,
            fontSize: body.fontSize,
            lineHeight: body.lineHeight,
          }}
        >
          {label}
        </Text>
        {detail ? (
          <Text
            style={{
              marginTop: 2,
              color: colors.text2,
              fontFamily: bodySm.fontFamily,
              fontSize: bodySm.fontSize,
              lineHeight: bodySm.lineHeight,
            }}
          >
            {detail}
          </Text>
        ) : null}
      </View>
      <View
        style={[
          styles.radio,
          {
            borderColor: selected ? colors.accent : colors.text3,
            backgroundColor: selected ? colors.accent : "transparent",
          },
        ]}
      >
        {selected ? (
          <Check size={14} color="#FFFFFF" strokeWidth={2.6} />
        ) : null}
      </View>
    </SoftPress>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: layout.minHit + 12,
    paddingHorizontal: space.lg,
    paddingVertical: 14,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
  copy: {
    flex: 1,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
});
