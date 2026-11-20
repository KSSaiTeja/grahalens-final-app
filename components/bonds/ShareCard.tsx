import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { BondConstellation } from "@/components/bonds/BondConstellation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  DOMAIN_LABELS,
  domainIntensity,
  type BondRecord,
} from "@/lib/bonds";
import { fontFamilies, radii, space, useTheme } from "@/theme";

type Props = {
  bond: BondRecord;
  selfLabel?: string;
};

/**
 * B6 — screenshot-ready share surface. Quiet, no snark, no %.
 */
export function ShareCard({ bond, selfLabel = "You" }: Props) {
  const { colors, type } = useTheme();
  const body = type("body");
  const bodySm = type("bodySm");
  const meta = type("meta");
  const dominant = bond.synastry.dominant;

  return (
    <GlassPanel floating style={styles.card}>
      <Text
        style={{
          fontFamily: fontFamilies.display,
          fontSize: 28,
          letterSpacing: -0.4,
          color: colors.text1,
          textAlign: "center",
        }}
      >
        Grahalens
      </Text>
      <Text
        style={{
          marginTop: space.xs,
          fontFamily: meta.fontFamily,
          fontSize: meta.fontSize,
          letterSpacing: meta.letterSpacing,
          color: colors.text3,
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        Bond constellation
      </Text>

      <View style={styles.constellation}>
        <BondConstellation
          report={bond.synastry}
          selfLabel={selfLabel}
          otherLabel={bond.label}
          compact
          size={220}
        />
      </View>

      <Text
        style={{
          fontFamily: body.fontFamily,
          fontSize: body.fontSize,
          lineHeight: body.lineHeight,
          color: colors.text1,
          textAlign: "center",
        }}
      >
        {selfLabel} · {bond.label}
      </Text>
      <Text
        style={{
          marginTop: space.sm,
          fontFamily: bodySm.fontFamily,
          fontSize: bodySm.fontSize,
          lineHeight: bodySm.lineHeight,
          color: colors.text2,
          textAlign: "center",
        }}
      >
        {DOMAIN_LABELS[dominant]} reads{" "}
        {domainIntensity(bond.synastry.domains[dominant].value).toLowerCase()}{" "}
        in this braid — evidence first, never carnival.
      </Text>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: space.xl,
    paddingHorizontal: space.lg,
    borderRadius: radii.xl,
  },
  constellation: {
    marginVertical: space.lg,
    alignItems: "center",
  },
});
