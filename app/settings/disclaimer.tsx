import React from "react";

import { LegalDocView } from "@/components/settings/LegalDocView";
import { DISCLAIMER } from "@/lib/settings/legal";

/** X11 — Astrology / AI disclaimer. */
export default function DisclaimerSettingsScreen() {
  return <LegalDocView doc={DISCLAIMER} testID="settings-disclaimer" />;
}
