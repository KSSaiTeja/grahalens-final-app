import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { ChevronRight } from "lucide-react-native";

import { BigThreePeek } from "@/components/billing/BigThreePeek";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { SoftPress } from "@/components/ui/SoftPress";
import type { NatalChart } from "@/lib/ephemeris/types";
import { useTheme, radii } from "@/theme";

type Props = {
  natal: NatalChart;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Chart peek on Sky home — Big Three strip opens Chart tab (SCREENS S1).
 */
export function ChartPeek({ natal, onPress, style }: Props) {
  const { colors, type } = useTheme();
  const meta = type("meta");

  const body = (
    <GlassPanel floating style={[styles.panel, style]}>
      <Text
        style={{
          fontFamily: meta.fontFamily,
          fontSize: 10,
          letterSpacing: meta.letterSpacing,
          color: colors.text3,
          textTransform: "uppercase",
          marginBottom: 10,
          paddingHorizontal: 4,
        }}
      >
        Chart peek
      </Text>
      <BigThreePeek natal={natal} />
      {onPress ? (
        <View style={styles.action}>
          <Text
            style={{
              fontFamily: meta.fontFamily,
              fontSize: 10,
              letterSpacing: meta.letterSpacing,
              color: colors.text2,
              textTransform: "uppercase",
            }}
          >
            Open Living Chart
          </Text>
          <ChevronRight size={18} color={colors.text2} strokeWidth={1.8} />
        </View>
      ) : null}
    </GlassPanel>
  );

  if (!onPress) return body;

  return (
    <SoftPress
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Open Living Chart"
      scale={false}
    >
      {body}
    </SoftPress>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: radii.xl,
  },
  action: {
    marginTop: 12,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
