import React, { useState } from "react";
import { Alert } from "react-native";
import { RotateCcw } from "lucide-react-native";

import { Button } from "@/components/ui/Button";
import { restorePurchases } from "@/lib/billing/restore";
import type { StyleProp, ViewStyle } from "react-native";

type Props = {
  onSuccess?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function RestoreButton({ onSuccess, style, testID }: Props) {
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    setBusy(true);
    try {
      const result = await restorePurchases();
      if (result.status === "success") {
        onSuccess?.();
        return;
      }
      if (result.status === "empty") {
        Alert.alert(
          "No active subscription",
          "We could not find an active Grahalens Private subscription on this account.",
        );
        return;
      }
      Alert.alert("Restore failed", result.message);
    } catch {
      Alert.alert("Restore failed", "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      testID={testID ?? "restore-purchases"}
      label="Restore purchases"
      icon={RotateCcw}
      variant="ghost"
      loading={busy}
      onPress={() => void handle()}
      style={style}
    />
  );
}
