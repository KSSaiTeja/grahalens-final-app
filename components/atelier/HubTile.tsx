import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { Lock } from "lucide-react-native";

import { SoftPress } from "@/components/ui/SoftPress";
import { radii, space, useTheme } from "@/theme";

type Props = {
  title: string;
  body: string;
  icon: LucideIcon;
  onPress: () => void;
  gated?: boolean;
  testID?: string;
};

export function HubTile({
  title,
  body,
  icon: Glyph,
  onPress,
  gated,
  testID,
}: Props) {
  const { colors, type } = useTheme();
  const titleStyle = type("title");
  const bodySm = type("bodySm");
  const meta = type("meta");

  return (
    <SoftPress
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={gated ? `${title}, opens with Private` : title}
      testID={testID}
      style={[
        styles.tile,
        {
          backgroundColor: "rgba(255,255,255,0.55)",
          borderColor: colors.hairline,
        },
      ]}
    >
      <View style={styles.top}>
        <Glyph
          color={colors.accent}
          size={22}
          strokeWidth={1.7}
          accessibilityElementsHidden
        />
        {gated ? (
          <View style={styles.gate}>
            <Lock
              color={colors.text3}
              size={14}
              strokeWidth={1.8}
              accessibilityElementsHidden
            />
            <Text
              style={{
                fontFamily: meta.fontFamily,
                fontSize: 10,
                letterSpacing: meta.letterSpacing,
                color: colors.text3,
                textTransform: "uppercase",
              }}
            >
              Private
            </Text>
          </View>
        ) : null}
      </View>
      <Text
        style={{
          marginTop: space.sm,
          fontFamily: titleStyle.fontFamily,
          fontSize: 22,
          lineHeight: 28,
          color: colors.text1,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          marginTop: 6,
          fontFamily: bodySm.fontFamily,
          fontSize: bodySm.fontSize,
          lineHeight: bodySm.lineHeight,
          color: colors.text2,
        }}
      >
        {body}
      </Text>
    </SoftPress>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.lg,
    minHeight: 120,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
