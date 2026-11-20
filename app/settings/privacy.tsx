import React from "react";

import { LegalDocView } from "@/components/settings/LegalDocView";
import { PRIVACY_POLICY } from "@/lib/settings/legal";

/** X9 — Privacy policy. */
export default function PrivacySettingsScreen() {
  return <LegalDocView doc={PRIVACY_POLICY} testID="settings-privacy" />;
}
