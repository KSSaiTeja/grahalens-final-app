import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

import { SoftPress } from "@/components/ui/SoftPress";
import { radii, space, useTheme } from "@/theme";

type Props = {
  label: string;
  body: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  testID?: string;
  disabled?: boolean;
};

/** Settings toggle row — observatory list IA. */
export function PrefToggle({
  label,
  body,
  value,
  onValueChange,
  testID,
  disabled,
}: Props) {
  const { colors, type } = useTheme();
  const title = type("title");
  const bodySm = type("bodySm");

  return (
    <SoftPress
      testID={testID}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !!disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={[
        styles.row,
        {
          backgroundColor: colors.surface,
          borderColor: colors.hairline,
          opacity: disabled ? 0.55 : 1,
        },
      ]}
    >
      <View style={styles.copy}>
        <Text
          style={{
            fontFamily: title.fontFamily,
            fontSize: 17,
            lineHeight: 22,
            color: colors.text1,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            marginTop: 4,
            fontFamily: bodySm.fontFamily,
            fontSize: bodySm.fontSize,
            lineHeight: bodySm.lineHeight,
            color: colors.text2,
          }}
        >
          {body}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.raised, true: colors.accentSoft }}
        thumbColor={value ? colors.accent : colors.text3}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    </SoftPress>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    padding: space.lg,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 72,
  },
  copy: {
    flex: 1,
  },
});
