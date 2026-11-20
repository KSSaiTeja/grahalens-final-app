import React from "react";
import { StyleSheet, Text } from "react-native";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { space, useTheme } from "@/theme";

type Props = {
  prompt: string;
  dominant?: string | null;
};

/** R3 — weather-linked compose prompt (not a sticker; quiet field note). */
export function WeatherPrompt({ prompt, dominant }: Props) {
  const { colors, type } = useTheme();
  const body = type("body");
  const meta = type("meta");

  return (
    <GlassPanel floating style={styles.panel}>
      <Text
        style={{
          fontFamily: meta.fontFamily,
          fontSize: 10,
          letterSpacing: meta.letterSpacing,
          color: colors.text3,
          textTransform: "uppercase",
        }}
      >
        {dominant ? `Sky · ${dominant}` : "Sky prompt"}
      </Text>
      <Text
        style={{
          marginTop: space.sm,
          fontFamily: body.fontFamily,
          fontSize: body.fontSize,
          lineHeight: body.lineHeight,
          color: colors.text1,
        }}
      >
        {prompt}
      </Text>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 24,
  },
});
