import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { RASI_LABELS } from "@/lib/ephemeris/constants";
import { getPlacement, type NatalChart } from "@/lib/ephemeris/types";
import { formatDegreeInSign } from "@/lib/format/degrees";
import { useTheme, radii } from "@/theme";
import { Hairline } from "@/components/ui/Hairline";

type Props = {
  natal: NatalChart;
};

const BIG_THREE = [
  { id: "sun" as const, label: "Sun" },
  { id: "moon" as const, label: "Moon" },
  { id: "lagna" as const, label: "Lagna" },
];

/**
 * Soft paywall proof strip — Big Three after first compute (A11).
 */
export function BigThreePeek({ natal }: Props) {
  const { colors, type } = useTheme();
  const meta = type("meta");
  const body = type("body");

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.surface,
          borderColor: colors.hairlineStrong,
        },
      ]}
      accessibilityRole="summary"
      accessibilityLabel="Your Big Three"
    >
      {BIG_THREE.map((item, i) => {
        const p = getPlacement(natal, item.id);
        const value = `${RASI_LABELS[p.sign]} ${formatDegreeInSign(p.degreeInSign)}`;
        return (
          <React.Fragment key={item.id}>
            {i > 0 ? <Hairline vertical style={styles.divider} /> : null}
            <View style={styles.cell}>
              <Text
                style={{
                  fontFamily: meta.fontFamily,
                  fontSize: 10,
                  letterSpacing: meta.letterSpacing,
                  color: colors.text3,
                  textTransform: "uppercase",
                }}
              >
                {item.label}
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  fontFamily: body.fontFamily,
                  fontSize: 14,
                  color: colors.text1,
                }}
                numberOfLines={1}
              >
                {value}
              </Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    borderRadius: radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 6,
  },
  divider: {
    alignSelf: "stretch",
    width: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
});
