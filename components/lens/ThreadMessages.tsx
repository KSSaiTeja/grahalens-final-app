import React, { useEffect, useRef } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import type { ChatMessage } from "@/lib/types/db";
import { radii, space, useTheme } from "@/theme";

type Props = {
  messages: ChatMessage[];
};

function MessageRow({ message }: { message: ChatMessage }) {
  const { colors, type } = useTheme();
  const body = type("body");
  const meta = type("meta");
  const isUser = message.role === "user";

  return (
    <View
      style={[
        styles.row,
        isUser ? styles.rowUser : styles.rowAssistant,
      ]}
      accessibilityRole="text"
    >
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isUser ? colors.cta : colors.surface,
            borderColor: isUser ? colors.cta : colors.hairline,
          },
        ]}
      >
        {!isUser ? (
          <Text
            style={{
              fontFamily: meta.fontFamily,
              fontSize: 10,
              letterSpacing: meta.letterSpacing,
              color: colors.text3,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Lens
          </Text>
        ) : null}
        <Text
          style={{
            fontFamily: body.fontFamily,
            fontSize: body.fontSize,
            lineHeight: body.lineHeight,
            color: isUser ? colors.onCta : colors.text1,
          }}
        >
          {message.content}
        </Text>
      </View>
    </View>
  );
}

/** Scrollable thread transcript. */
export function ThreadMessages({ messages }: Props) {
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (messages.length === 0) return;
    const t = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);
    return () => clearTimeout(t);
  }, [messages.length]);

  return (
    <FlatList
      ref={listRef}
      data={messages}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => <MessageRow message={item} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: space.md,
    paddingTop: space.sm,
    paddingBottom: space.lg,
    gap: space.sm,
    flexGrow: 1,
  },
  row: {
    width: "100%",
  },
  rowUser: {
    alignItems: "flex-end",
  },
  rowAssistant: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "88%",
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 2,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
