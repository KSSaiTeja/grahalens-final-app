import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";

import { BondListItem } from "@/components/bonds";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { EmptyState } from "@/components/ui/EmptyState";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import {
  requirePrivate,
  useIsPrivate,
} from "@/lib/billing/entitlements";
import { track } from "@/lib/analytics";
import { useCanAddBond } from "@/lib/bonds";
import { space, useTheme } from "@/theme";

const EMPTY_COPY =
  "No one in your sky yet. Add a birth to see how two charts braid.";

/** B1 — Bond list. Free tier: 1 bond; add #2 → requirePrivate("bond_limit"). */
export default function BondsScreen() {
  const router = useRouter();
  const { colors, fontsLoaded } = useTheme();
  const isPrivate = useIsPrivate();
  const { data: bonds, canAdd, isLoading } = useCanAddBond(isPrivate);

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  const onAdd = () => {
    if (!canAdd) {
      const gate = requirePrivate("bond_limit");
      if (!gate.allowed) {
        track("bond_gate_hit", { reason: "bond_limit" });
        router.push(gate.href as Href);
      }
      return;
    }
    router.push("/(app)/bonds/add" as Href);
  };

  const empty = !isLoading && (bonds?.length ?? 0) === 0;

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]} testID="bonds-home">
        <ScreenHeader
          title="Bonds"
          subtitle="Two charts, one braid"
          actionIcon={Plus}
          actionLabel="Add bond"
          actionTestID="bonds-add"
          onAction={onAdd}
        />
        <View style={styles.bannerPad}>
          <OfflineBanner />
        </View>
        {empty ? (
          <EmptyState
            title="Bonds"
            body={EMPTY_COPY}
            actionLabel="Add a birth"
            onAction={onAdd}
            withOrb={false}
          />
        ) : (
          <FlatList
            data={bonds ?? []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <BondListItem
                bond={item}
                onPress={() =>
                  router.push(`/(app)/bonds/${item.id}` as Href)
                }
              />
            )}
          />
        )}
      </SafeAreaView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  bannerPad: {
    paddingHorizontal: space.lg,
  },
  list: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl,
    gap: space.sm,
  },
});
