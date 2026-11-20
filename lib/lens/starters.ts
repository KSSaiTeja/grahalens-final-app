/**
 * Chart-grounded Lens starters (L1 chips + L4 topics).
 */

import { RASI_LABELS } from "@/lib/ephemeris/constants";
import {
  getPlacement,
  type NatalChart,
} from "@/lib/ephemeris/types";

export type StarterTopic = "love" | "work" | "self";

export type LensStarter = {
  id: string;
  topic: StarterTopic;
  /** Short chip label */
  label: string;
  /** Full prompt sent to companion */
  prompt: string;
};

const TOPIC_META: Record<
  StarterTopic,
  { title: string; blurb: string }
> = {
  love: {
    title: "Love",
    blurb: "Bonds, desire, and the rooms Venus tends.",
  },
  work: {
    title: "Work",
    blurb: "Effort, visibility, and the Sun’s house pressure.",
  },
  self: {
    title: "Self",
    blurb: "Mood weather and the Moon’s quiet signal.",
  },
};

export function starterTopicMeta(topic: StarterTopic) {
  return TOPIC_META[topic];
}

/** Three grounded starters from natal placements (Hick’s: keep few). */
export function chartGroundedStarters(natal: NatalChart): LensStarter[] {
  const venus = getPlacement(natal, "venus");
  const sun = getPlacement(natal, "sun");
  const moon = getPlacement(natal, "moon");

  return [
    {
      id: "love",
      topic: "love",
      label: "Love & Venus",
      prompt: `With Venus in ${RASI_LABELS[venus.sign]} in my ${venus.house}th house, what friction or opening am I carrying in closeness right now?`,
    },
    {
      id: "work",
      topic: "work",
      label: "Work & Sun",
      prompt: `Sun sits in ${RASI_LABELS[sun.sign]} in my ${sun.house}th. Where is the clearest window for focused effort today?`,
    },
    {
      id: "self",
      topic: "self",
      label: "Self & Moon",
      prompt: `Moon in ${RASI_LABELS[moon.sign]} presses my ${moon.house}th. What is the quiet pressure I should name, without drama?`,
    },
  ];
}

/** Extra topic prompts for L4 (still grounded). */
export function startersForTopic(
  natal: NatalChart,
  topic: StarterTopic,
): LensStarter[] {
  const base = chartGroundedStarters(natal).find((s) => s.topic === topic);
  if (!base) return [];

  if (topic === "love") {
    const venus = getPlacement(natal, "venus");
    return [
      base,
      {
        id: "love-2",
        topic: "love",
        label: "Soft ask",
        prompt: `Venus in ${RASI_LABELS[venus.sign]} — what is one honest question I can bring to a bond without pushing?`,
      },
    ];
  }

  if (topic === "work") {
    const sun = getPlacement(natal, "sun");
    return [
      base,
      {
        id: "work-2",
        topic: "work",
        label: "Priority",
        prompt: `Given Sun in ${RASI_LABELS[sun.sign]} house ${sun.house}, what should I protect on my calendar this week?`,
      },
    ];
  }

  const moon = getPlacement(natal, "moon");
  return [
    base,
    {
      id: "self-2",
      topic: "self",
      label: "Reset",
      prompt: `Moon in ${RASI_LABELS[moon.sign]} — name one small reset that respects this weather.`,
    },
  ];
}
