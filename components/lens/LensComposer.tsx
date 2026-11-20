import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SoftPress } from "@/components/ui/SoftPress";
import { Icon } from "@/components/icons/Icon";
import { layout, radii, space, useTheme } from "@/theme";

type Props = {
  onSend: (text: string) => void;
  disabled?: boolean;
  sending?: boolean;
  placeholder?: string;
  /** Extra bottom inset (e.g. tab bar). Safe area is always applied. */
  bottomOffset?: number;
};

/** Floating bottom composer — raised surface + champagne send (Mobbin L1). */
export function LensComposer({
  onSend,
  disabled = false,
  sending = false,
  placeholder = "Ask Lens…",
  bottomOffset = 0,
}: Props) {
  const { colors, type } = useTheme();
  const insets = useSafeAreaInsets();
  const body = type("body");
  const [text, setText] = useState("");
  const canSend = text.trim().length > 0 && !disabled && !sending;

  const submit = () => {
    if (!canSend) return;
    const next = text.trim();
    setText("");
    onSend(next);
  };

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: Math.max(insets.bottom, space.sm) + bottomOffset,
          backgroundColor: colors.void,
          borderTopColor: colors.hairline,
        },
      ]}
    >
      <View
        style={[
          styles.surface,
          {
            backgroundColor: colors.surface,
            borderColor: colors.hairline,
          },
        ]}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={colors.text3}
          editable={!disabled && !sending}
          multiline
          maxLength={2000}
          testID="lens-composer-input"
          style={{
            flex: 1,
            maxHeight: 120,
            minHeight: 24,
            fontFamily: body.fontFamily,
            fontSize: body.fontSize,
            lineHeight: body.lineHeight,
            color: colors.text1,
            paddingVertical: 2,
          }}
          accessibilityLabel="Message Lens"
          onSubmitEditing={submit}
          blurOnSubmit={false}
        />
        <SoftPress
          onPress={submit}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="Send message"
          testID="lens-send"
          style={[
            styles.send,
            {
              backgroundColor: canSend ? colors.cta : colors.raised,
              opacity: canSend ? 1 : 0.55,
            },
          ]}
        >
          {sending ? (
            <ActivityIndicator color={colors.onCta} size="small" />
          ) : (
            <Icon
              name="system.spark"
              size={18}
              color={canSend ? colors.onCta : colors.text3}
            />
          )}
        </SoftPress>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: space.md,
    paddingTop: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  surface: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: space.sm,
    paddingLeft: space.md,
    paddingRight: space.sm,
    paddingVertical: space.sm,
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: layout.minHit,
  },
  send: {
    width: layout.minHit - 4,
    height: layout.minHit - 4,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
});
