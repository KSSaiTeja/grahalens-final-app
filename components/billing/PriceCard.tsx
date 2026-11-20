import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";

import { useTheme, radii, space } from "@/theme";
import { SoftPress } from "@/components/ui/SoftPress";
import type { BillingPackage } from "@/lib/billing/types";
import type { PlanOffer } from "@/lib/billing/catalog";

type Props = {
  plan: PlanOffer | BillingPackage;
  active: boolean;
  onPress: () => void;
};

/**
 * Single plan card — used by PaywallPlans for dynamic offerings
 * and by PlanCards for static catalog. Observatory chrome, no decoration.
 */
export function PriceCard({ plan, active, onPress }: Props) {
  const { colors, type } = useTheme();
  const title = type("title");
  const meta = type("meta");
  const bodySm = type("bodySm");

  return (
    <SoftPress
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${plan.title} ${plan.priceLabel} ${plan.periodLabel}`}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: active ? colors.accentSoft : "rgba(255,255,255,0.46)",
          borderColor: active ? colors.accent : colors.hairlineStrong,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <Text
              style={{
                fontFamily: title.fontFamily,
                fontSize: title.fontSize,
                lineHeight: title.lineHeight,
                color: colors.text1,
              }}
            >
              {plan.title}
            </Text>
            {plan.badge ? (
              <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
                <Text
                  style={{
                    fontFamily: meta.fontFamily,
                    fontSize: 12,
                    color: colors.accent,
                  }}
                >
                  {plan.badge}
                </Text>
              </View>
            ) : null}
          </View>
          <Text
            style={{
              marginTop: 4,
              fontFamily: bodySm.fontFamily,
              fontSize: bodySm.fontSize,
              color: colors.text2,
            }}
          >
            {plan.detail}
          </Text>
        </View>
        <View style={styles.priceCol}>
          <Text
            style={{
              fontFamily: title.fontFamily,
              fontSize: title.fontSize,
              color: active ? colors.cta : colors.text1,
              textAlign: "right",
            }}
          >
            {plan.priceLabel}
          </Text>
          <Text
            style={{
              marginTop: 2,
              fontFamily: meta.fontFamily,
              fontSize: 12,
              color: colors.text3,
              textAlign: "right",
            }}
          >
            {plan.periodLabel}
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.radio,
          {
            borderColor: active ? colors.cta : colors.hairlineStrong,
            backgroundColor: active ? colors.cta : "transparent",
          },
        ]}
      >
        {active ? <Check size={14} color={colors.onCta} strokeWidth={2.6} /> : null}
      </View>
    </SoftPress>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: space.md,
    paddingRight: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 72,
  },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  copy: { flex: 1 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  priceCol: { alignItems: "flex-end", minWidth: 72 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
});
