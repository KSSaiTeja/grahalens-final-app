/**
 * Motion — ABY soft fluid + Grahalens sky/Lens states.
 * Budget ≤ 2 concurrent idle animations.
 */

export const motion = {
  press: {
    durationMs: 140,
    scale: 0.98,
    opacity: 0.9,
  },
  enter: {
    durationMs: 560,
    translateY: 18,
    bezier: [0.22, 1, 0.36, 1] as const,
  },
  staggerMs: 80,
  breathe: {
    durationMs: 4800,
    from: 0.8,
    to: 1,
    easing: 'ease-in-out' as const,
  },
  chartIn: {
    strokeMs: 900,
    fadeMs: 420,
  },
  transitSettle: {
    durationMs: 1100,
    easing: 'ease-out' as const,
  },
  weatherDrift: {
    durationMs: 16000,
    openingThreshold: 0.6,
  },
  flare: {
    durationMs: 1800,
  },
  sheetUp: {
    durationMs: 500,
    bezier: [0.22, 1, 0.36, 1] as const,
  },
  readingScan: {
    durationMs: 1600,
  },
  dot: {
    durationMs: 240,
  },
  spring: {
    damping: 20,
    stiffness: 200,
    mass: 0.9,
  },
} as const;

export type MotionName = keyof typeof motion;
