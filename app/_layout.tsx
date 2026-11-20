import React, { useEffect } from "react";
import { Stack, useRouter, type Href } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";

import { BillingProvider } from "@/lib/billing/BillingProvider";
import { SessionProvider } from "@/lib/session";
import { configureNotificationHandler } from "@/lib/settings/local-notifications";
import { ThemeProvider, useTheme } from "@/theme";

function useNotificationObserver() {
  const router = useRouter();

  useEffect(() => {
    configureNotificationHandler();

    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;
      if (typeof url === "string") {
        router.push(url as Href);
      }
    }

    const last = Notifications.getLastNotificationResponse();
    if (last?.notification) {
      redirect(last.notification);
    }

    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        redirect(response.notification);
      },
    );
    return () => sub.remove();
  }, [router]);
}

function RootNavigator() {
  const { colors, theme } = useTheme();
  useNotificationObserver();

  return (
    <>
      <StatusBar style={theme === "ink" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { flex: 1, backgroundColor: colors.void },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="paywall" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="auth/callback" />
        <Stack.Screen name="dev/system" />
        <Stack.Screen name="dev/screens" />
      </Stack>
    </>
  );
}

/**
 * Root layout — Theme + Session + Billing (Zustand entitlement snapshot).
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <SessionProvider>
            <BillingProvider>
              <RootNavigator />
            </BillingProvider>
          </SessionProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
