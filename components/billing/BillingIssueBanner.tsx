import React from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useRouter, type Href } from "expo-router";

import { useBillingIssue } from "@/lib/billing/entitlements";
import { SoftPress } from "@/components/ui/SoftPress";
import { Icon } from "@/components/icons/Icon";
import { errorCopy } from "@/lib/errors/catalog";
import { useTheme, space } from "@/theme";

type Props = {
  style?: StyleProp<ViewStyle>;
};

/**
 * G3 — Billing issue grace banner on Sky (and Settings).
 * Visible when CustomerInfo reports a billing hold / grace period.
 */
export function BillingIssueBanner({ style }: Props) {
  const router = useRouter();
  const show = useBillingIssue();
  const { colors, type } = useTheme();
  const bodySm = type("bodySm");
  const meta = type("meta");
  const catalog = errorCopy("billing_issue");

  if (!show) return null;

  return (
    <SoftPress
      testID="billing-issue-banner"
      accessibilityRole="button"
      accessibilityLabel="Billing issue. Open subscription settings."
      onPress={() => router.push("/settings/subscription" as Href)}
      style={[
        styles.root,
        {
          backgroundColor: colors.surface,
          borderColor: colors.caution,
        },
        style,
      ]}
    >
      <Icon name="system.alert" size={18} color={colors.caution} strokeWidth={1.5} />
      <View style={styles.copy}>
        <Text
          style={{
            fontFamily: meta.fontFamily,
            fontSize: 10,
            letterSpacing: meta.letterSpacing,
            color: colors.caution,
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
          {catalog.body}
        </Text>
      </View>
    </SoftPress>
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
