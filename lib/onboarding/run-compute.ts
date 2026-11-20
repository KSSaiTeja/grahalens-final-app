/**
 * A10 computing stages — real ephemeris calls (resolve → natal → dasha → weather).
 */
import { fromZonedTime } from "date-fns-tz";

import { computeDasha } from "@/lib/ephemeris/dasha";
import { computeNatal, resolveBirthUtc } from "@/lib/ephemeris/natal";
import { computeTransits } from "@/lib/ephemeris/transits";
import type { NatalBirthInput, NatalChart } from "@/lib/ephemeris/types";
import type { OnboardingPlace } from "@/lib/store/onboarding";
import type { StoredBirth } from "@/lib/store/chart";

export type ComputeStageId = "resolve" | "natal" | "dasha" | "weather";

export const COMPUTE_STAGES: readonly {
  id: ComputeStageId;
  label: string;
}[] = [
  { id: "resolve", label: "Resolve birth moment" },
  { id: "natal", label: "Compute natal chart" },
  { id: "dasha", label: "Vimshottari dasha" },
  { id: "weather", label: "Sky weather frame" },
] as const;

export type BirthDraft = {
  date: string;
  time: string | null;
  timeUnknown: boolean;
  place: OnboardingPlace;
};

/** Civil date/time + place → NatalBirthInput (`birthAt` ISO). */
export function draftToNatalInput(draft: BirthDraft): NatalBirthInput {
  const localTime = draft.timeUnknown || !draft.time ? "12:00" : draft.time;
  const localIso = `${draft.date}T${localTime}:00`;
  const utc = fromZonedTime(localIso, draft.place.tz);
  return {
    birthAt: utc.toISOString(),
    lat: draft.place.lat,
    lng: draft.place.lng,
    tz: draft.place.tz,
    timeUnknown: draft.timeUnknown,
  };
}

export function draftToStoredBirth(draft: BirthDraft): StoredBirth {
  const input = draftToNatalInput(draft);
  return {
    ...input,
    date: draft.date,
    time: draft.timeUnknown ? null : draft.time,
    placeLabel: draft.place.label,
  };
}

export type ComputeResult = {
  birth: StoredBirth;
  natal: NatalChart;
};

export type StageProgress = {
  stage: ComputeStageId;
  done: boolean;
};

/**
 * Run stages sequentially. `onStage` fires when a stage starts and when it completes.
 */
export async function runOnboardingCompute(
  draft: BirthDraft,
  onStage?: (p: StageProgress) => void,
): Promise<ComputeResult> {
  const input = draftToNatalInput(draft);
  const birth = draftToStoredBirth(draft);

  onStage?.({ stage: "resolve", done: false });
  const resolved = resolveBirthUtc(input);
  if (Number.isNaN(resolved.utc.getTime())) {
    throw new Error(
      "Could not resolve birth moment. Check date, time, and place.",
    );
  }
  await yieldFrame();
  onStage?.({ stage: "resolve", done: true });

  onStage?.({ stage: "natal", done: false });
  const natal = computeNatal(input);
  if (natal.placements.length !== 10) {
    throw new Error("Natal chart incomplete — expected nine grahas + Lagna.");
  }
  await yieldFrame();
  onStage?.({ stage: "natal", done: true });

  onStage?.({ stage: "dasha", done: false });
  computeDasha(natal);
  await yieldFrame();
  onStage?.({ stage: "dasha", done: true });

  onStage?.({ stage: "weather", done: false });
  // Transit sky at “now” — weather axes derive from this frame.
  computeTransits(natal, new Date());
  await yieldFrame();
  onStage?.({ stage: "weather", done: true });

  return { birth, natal };
}

function yieldFrame(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 280));
}
