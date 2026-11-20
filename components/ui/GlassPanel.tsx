import React, { type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { radii, shadows, space, useTheme } from "@/theme";

type Props = {
  children: ReactNode;
  padded?: boolean;
  floating?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * ABY card — solid white squircle + soft shadow.
 * Feels layered over the gray void, not frosted glass soup.
 */
export function GlassPanel({
  children,
  padded = true,
  floating = false,
  style,
}: Props) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.frame,
        floating ? shadows.float : shadows.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.hairline,
          padding: padded ? space.lg : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
});
