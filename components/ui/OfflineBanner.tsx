import React from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Icon } from "@/components/icons/Icon";
import { errorCopy } from "@/lib/errors/catalog";
import {
  OFFLINE_BANNER_BODY,
  useIsOnline,
} from "@/lib/network/online";
import { useTheme, space } from "@/theme";

type Props = {
  style?: StyleProp<ViewStyle>;
};

/**
 * G2 — Offline banner (BRAND §11 L3).
 * Honest denial: local compute/journal ok; Lens/network features quiet.
 */
export function OfflineBanner({ style }: Props) {
  const online = useIsOnline();
  const { colors, type } = useTheme();
  const bodySm = type("bodySm");
  const meta = type("meta");
  const catalog = errorCopy("offline");

  if (online) return null;

  return (
    <View
      testID="offline-banner"
      accessibilityRole="summary"
      accessibilityLabel={OFFLINE_BANNER_BODY}
      style={[
        styles.root,
        {
          backgroundColor: colors.surface,
          borderColor: colors.info,
        },
        style,
      ]}
    >
      <Icon
        name="system.offline"
        size={18}
        color={colors.info}
        strokeWidth={1.5}
      />
      <View style={styles.copy}>
        <Text
          style={{
            fontFamily: meta.fontFamily,
            fontSize: 10,
            letterSpacing: meta.letterSpacing,
            color: colors.info,
            textTransform: "uppercase",
          }}
        >
          {catalog.title}
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
          {OFFLINE_BANNER_BODY}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: space.md,
  },
  copy: {
    flex: 1,
  },
});
