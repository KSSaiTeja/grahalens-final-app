/**
 * Simple scroll-wheel column for date/time digits — Observatory, no kit.
 * Selection band sits *behind* the digits (never covers them).
 */
import React, { useEffect, useRef } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTheme, layout, radii } from "@/theme";

const ITEM_H = 44;

type Props = {
  values: string[];
  value: string;
  onChange: (v: string) => void;
  accessibilityLabel: string;
  width?: number;
};

export function WheelColumn({
  values,
  value,
  onChange,
  accessibilityLabel,
  width = 72,
}: Props) {
  const { colors, type } = useTheme();
  const body = type("body");
  const scrollRef = useRef<ScrollView>(null);
  const index = Math.max(0, values.indexOf(value));

  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: index * ITEM_H, animated: false });
    }, 16);
    return () => clearTimeout(t);
  }, [index]);

  const onMomentum = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const i = Math.round(y / ITEM_H);
    const clamped = Math.max(0, Math.min(values.length - 1, i));
    const next = values[clamped]!;
    if (next !== value) onChange(next);
    scrollRef.current?.scrollTo({ y: clamped * ITEM_H, animated: true });
  };

  return (
    <View style={[styles.wrap, { width, height: ITEM_H * 3 }]}>
      <View
        pointerEvents="none"
        style={[
          styles.highlight,
          {
            borderColor: colors.hairlineStrong,
            backgroundColor: colors.raised,
          },
        ]}
      />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentum}
        contentContainerStyle={{ paddingVertical: ITEM_H }}
        accessibilityLabel={accessibilityLabel}
      >
        {values.map((v) => {
          const active = v === value;
          return (
            <View key={v} style={styles.item}>
              <Text
                style={{
                  fontFamily: body.fontFamily,
                  fontSize: active ? 22 : 17,
                  fontWeight: active ? "600" : "400",
                  color: active ? colors.text1 : colors.text3,
                  textAlign: "center",
                }}
              >
                {v}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
  },
  highlight: {
    position: "absolute",
    left: 0,
    right: 0,
    top: ITEM_H,
    height: ITEM_H,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.sm,
    zIndex: 0,
  },
  scroll: {
    zIndex: 1,
  },
  item: {
    height: ITEM_H,
    minHeight: layout.minHit > ITEM_H ? ITEM_H : layout.minHit,
    justifyContent: "center",
  },
});
