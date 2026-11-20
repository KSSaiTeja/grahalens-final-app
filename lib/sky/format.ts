/**
 * Shared Sky format helpers for screens + components.
 */

import type { MuhurtaKind, MuhurtaMoment } from "@/lib/sky/muhurta-moments";
import type { WeatherAxisId } from "@/lib/sky/sky-weather";

export function capitalize(s: string): string {
  return s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1);
}

export function formatLocalHm(iso: string, tz: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

export function formatMuhurtaWindow(m: MuhurtaMoment, tz: string): string {
  return `${formatLocalHm(m.startAt, tz)}–${formatLocalHm(m.endAt, tz)}`;
}

export const AXIS_LABELS: Record<WeatherAxisId, string> = {
  clarity: "Clarity",
  pressure: "Pressure",
  friction: "Friction",
  opening: "Opening",
};

export const KIND_LABELS: Record<MuhurtaKind, string> = {
  connect: "Connect",
  focus: "Focus",
  create: "Create",
  care: "Care",
  move: "Move",
  rest: "Rest",
};

export const WEATHER_ICON: Record<
  WeatherAxisId,
  "weather.clarity" | "weather.pressure" | "weather.friction" | "weather.opening"
> = {
  clarity: "weather.clarity",
  pressure: "weather.pressure",
  friction: "weather.friction",
  opening: "weather.opening",
};
