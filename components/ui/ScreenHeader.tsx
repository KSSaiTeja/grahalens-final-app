import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ArrowLeft, type LucideIcon } from "lucide-react-native";

import { fontFamilies, layout, space, useTheme } from "@/theme";
import { IconButton } from "./IconButton";

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actionIcon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  actionTestID?: string;
  testID?: string;
};

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  actionIcon,
  actionLabel,
  onAction,
  actionTestID,
  testID,
}: Props) {
  const { colors, type } = useTheme();
  const titleStyle = type("title");
  const bodySm = type("bodySm");

  return (
    <View style={styles.row} testID={testID}>
      <View style={styles.side}>
        {onBack ? (
          <IconButton icon={ArrowLeft} label="Back" onPress={onBack} />
        ) : null}
      </View>
      <View style={styles.copy}>
        <Text
          numberOfLines={1}
          style={{
            color: colors.text1,
            fontFamily: fontFamilies.display,
            fontSize: titleStyle.fontSize,
            lineHeight: titleStyle.lineHeight,
            letterSpacing: titleStyle.letterSpacing,
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={{
              color: colors.text2,
              fontFamily: bodySm.fontFamily,
              fontSize: bodySm.fontSize,
              lineHeight: bodySm.lineHeight,
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={[styles.side, styles.sideEnd]}>
        {actionIcon && actionLabel && onAction ? (
          <IconButton
            icon={actionIcon}
            label={actionLabel}
            onPress={onAction}
            testID={actionTestID}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: layout.minHit + space.md,
    paddingHorizontal: space.md,
    flexDirection: "row",
    alignItems: "center",
  },
  side: {
    width: layout.minHit,
    alignItems: "flex-start",
  },
  sideEnd: {
    alignItems: "flex-end",
  },
  copy: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: space.sm,
  },
});
