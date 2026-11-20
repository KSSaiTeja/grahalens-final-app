import React from "react";

import { LegalDocView } from "@/components/settings/LegalDocView";
import { TERMS_OF_USE } from "@/lib/settings/legal";

/** X10 — Terms of use. */
export default function TermsSettingsScreen() {
  return <LegalDocView doc={TERMS_OF_USE} testID="settings-terms" />;
}
