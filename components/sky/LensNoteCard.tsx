import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { SoftPress } from "@/components/ui/SoftPress";
import { useTheme, radii, space } from "@/theme";

type Props = {
  text: string;
  /** Optional meta (e.g. source / date). */
  metaLabel?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * One Lens sky note — S1 composition (BRAND §07 / §13 sample tone).
 */
export function LensNoteCard({ text, metaLabel, onPress, style }: Props) {
  const { colors, type } = useTheme();
  const meta = type("meta");
  const body = type("body");

  const inner = (
    <GlassPanel floating style={[styles.card, style]}>
      <View style={styles.head}>
        <View style={[styles.dot, { backgroundColor: colors.accent }]} />
        <Text
          style={{
            fontFamily: meta.fontFamily,
            fontSize: 10,
            letterSpacing: meta.letterSpacing,
            color: colors.text3,
            textTransform: "uppercase",
          }}
        >
          Today’s note
        </Text>
        {metaLabel ? (
          <Text
            style={{
              marginLeft: "auto",
              fontFamily: meta.fontFamily,
              fontSize: 10,
              letterSpacing: meta.letterSpacing,
              color: colors.text3,
              textTransform: "uppercase",
            }}
          >
            {metaLabel}
          </Text>
        ) : null}
      </View>
      <Text
        style={{
          marginTop: space.sm,
          fontFamily: body.fontFamily,
          fontSize: body.fontSize,
          lineHeight: body.lineHeight,
          color: colors.text1,
        }}
      >
        {text}
      </Text>
    </GlassPanel>
  );

  if (!onPress) return inner;

  return (
    <SoftPress
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Open inbox"
      scale={false}
    >
      {inner}
    </SoftPress>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
