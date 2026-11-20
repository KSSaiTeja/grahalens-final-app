import React, { useMemo } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Link, Stack, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { Hairline } from "@/components/ui/Hairline";
import {
  SCREEN_INVENTORY,
  type ScreenEntry,
} from "@/lib/dev/screens-inventory";
import { useTheme } from "@/theme";

/**
 * G8 — FlatList of every SCREENS.md route id with links (all built).
 */
export default function DevScreensScreen() {
  const { colors, type, fontsLoaded } = useTheme();
  const title = type("title");
  const body = type("body");
  const meta = type("meta");
  const bodySm = type("bodySm");

  const counts = useMemo(() => {
    const built = SCREEN_INVENTORY.filter((s) => s.status === "built").length;
    return { built, total: SCREEN_INVENTORY.length };
  }, []);

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  const renderItem = ({ item }: { item: ScreenEntry }) => {
    const pending = item.status === "pending";
    const row = (
      <View style={styles.row}>
        <View style={styles.idCol}>
          <Text
            style={{
              fontFamily: meta.fontFamily,
              fontSize: meta.fontSize,
              letterSpacing: meta.letterSpacing,
              color: colors.accent,
              textTransform: "uppercase",
            }}
          >
            {item.id}
          </Text>
          <Text
            style={{
              marginTop: 4,
              fontFamily: meta.fontFamily,
              fontSize: 10,
              letterSpacing: meta.letterSpacing,
              color: pending ? colors.text3 : colors.positive,
              textTransform: "uppercase",
            }}
          >
            {pending ? "Pending" : "Built"}
          </Text>
        </View>
        <View style={styles.copy}>
          <Text
            style={{
              fontFamily: body.fontFamily,
              fontSize: body.fontSize,
              color: pending ? colors.text2 : colors.text1,
            }}
          >
            {item.purpose}
          </Text>
          <Text
            style={{
              marginTop: 4,
              fontFamily: bodySm.fontFamily,
              fontSize: 12,
              color: colors.text3,
            }}
            numberOfLines={2}
          >
            {item.route}
          </Text>
        </View>
      </View>
    );

    if (pending) {
      return (
        <View
          style={[styles.item, { opacity: 0.55 }]}
          accessibilityState={{ disabled: true }}
        >
          {row}
          <Hairline />
        </View>
      );
    }

    return (
      <Link href={item.route as Href} asChild>
        <Pressable
          style={({ pressed }) => [
            styles.item,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          accessibilityRole="link"
          accessibilityLabel={`${item.id} ${item.purpose}`}
        >
          {row}
          <Hairline />
        </Pressable>
      </Link>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: "Screens", headerShown: true }} />
      <AtmosphericBackground atmosphere="neutral">
        <SafeAreaView style={styles.fill} edges={["bottom"]}>
          <View style={styles.header}>
            <Text
              style={{
                fontFamily: title.fontFamily,
                fontSize: title.fontSize,
                color: colors.text1,
              }}
            >
              Screen inventory
            </Text>
            <Text
              style={{
                marginTop: 6,
                fontFamily: bodySm.fontFamily,
                fontSize: bodySm.fontSize,
                color: colors.text2,
              }}
            >
              {counts.built} built · {counts.total} in SCREENS.md
            </Text>
          </View>
          <FlatList
            data={SCREEN_INVENTORY}
            keyExtractor={(item) => `${item.id}:${item.route}`}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
        </SafeAreaView>
      </AtmosphericBackground>
    </>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  list: {
    paddingBottom: 40,
  },
  item: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  row: {
    flexDirection: "row",
    gap: 14,
    paddingBottom: 14,
  },
  idCol: {
    width: 48,
  },
  copy: {
    flex: 1,
  },
});
