import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { SoftPress } from "@/components/ui/SoftPress";
import {
  DOMAIN_LABELS,
  domainIntensity,
  type BondRecord,
} from "@/lib/bonds";
import { radii, space, useTheme } from "@/theme";

type Props = {
  bond: BondRecord;
  onPress: () => void;
};

export function BondListItem({ bond, onPress }: Props) {
  const { colors, type } = useTheme();
  const body = type("body");
  const meta = type("meta");
  const dominant = bond.synastry.dominant;

  return (
    <SoftPress
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Bond with ${bond.label}`}
      style={[
        styles.row,
        {
          backgroundColor: "rgba(255,255,255,0.55)",
          borderColor: colors.hairline,
        },
      ]}
    >
      <View
        style={[styles.avatar, { backgroundColor: colors.accentSoft }]}
        accessibilityElementsHidden
      >
        <Text
          style={{
            fontFamily: body.fontFamily,
            fontSize: 18,
            color: colors.text1,
          }}
        >
          {bond.label.slice(0, 1).toUpperCase()}
        </Text>
      </View>
      <View style={styles.copy}>
        <Text
          style={{
            fontFamily: body.fontFamily,
            fontSize: body.fontSize,
            color: colors.text1,
          }}
        >
          {bond.label}
        </Text>
        <Text
          style={{
            marginTop: 4,
            fontFamily: meta.fontFamily,
            fontSize: meta.fontSize,
            letterSpacing: meta.letterSpacing,
            color: colors.text3,
            textTransform: "uppercase",
          }}
        >
          {DOMAIN_LABELS[dominant]} ·{" "}
          {domainIntensity(bond.synastry.domains[dominant].value)}
        </Text>
      </View>
    </SoftPress>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    padding: space.md,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 72,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
  },
});
