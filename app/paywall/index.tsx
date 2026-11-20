import { Redirect } from "expo-router";

/** SCREENS P1 `/paywall` → full plans screen. */
export default function PaywallIndex() {
  return <Redirect href="/paywall/plans" />;
}
