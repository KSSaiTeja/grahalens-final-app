/**
 * Offline top cities for A8 place search (PRD §11: geocode fail → city pick).
 * lat/lng/tz are authoritative for natal — no network required.
 */

export type CityOption = {
  id: string;
  label: string;
  country: string;
  lat: number;
  lng: number;
  tz: string;
};

export const TOP_CITIES: readonly CityOption[] = [
  {
    id: "hyd",
    label: "Hyderabad",
    country: "India",
    lat: 17.385,
    lng: 78.4867,
    tz: "Asia/Kolkata",
  },
  {
    id: "bom",
    label: "Mumbai",
    country: "India",
    lat: 19.076,
    lng: 72.8777,
    tz: "Asia/Kolkata",
  },
  {
    id: "del",
    label: "New Delhi",
    country: "India",
    lat: 28.6139,
    lng: 77.209,
    tz: "Asia/Kolkata",
  },
  {
    id: "blr",
    label: "Bengaluru",
    country: "India",
    lat: 12.9716,
    lng: 77.5946,
    tz: "Asia/Kolkata",
  },
  {
    id: "maa",
    label: "Chennai",
    country: "India",
    lat: 13.0827,
    lng: 80.2707,
    tz: "Asia/Kolkata",
  },
  {
    id: "ccu",
    label: "Kolkata",
    country: "India",
    lat: 22.5726,
    lng: 88.3639,
    tz: "Asia/Kolkata",
  },
  {
    id: "pnq",
    label: "Pune",
    country: "India",
    lat: 18.5204,
    lng: 73.8567,
    tz: "Asia/Kolkata",
  },
  {
    id: "lon",
    label: "London",
    country: "United Kingdom",
    lat: 51.5074,
    lng: -0.1278,
    tz: "Europe/London",
  },
  {
    id: "nyc",
    label: "New York",
    country: "United States",
    lat: 40.7128,
    lng: -74.006,
    tz: "America/New_York",
  },
  {
    id: "sfo",
    label: "San Francisco",
    country: "United States",
    lat: 37.7749,
    lng: -122.4194,
    tz: "America/Los_Angeles",
  },
  {
    id: "tor",
    label: "Toronto",
    country: "Canada",
    lat: 43.6532,
    lng: -79.3832,
    tz: "America/Toronto",
  },
  {
    id: "syd",
    label: "Sydney",
    country: "Australia",
    lat: -33.8688,
    lng: 151.2093,
    tz: "Australia/Sydney",
  },
  {
    id: "dxb",
    label: "Dubai",
    country: "United Arab Emirates",
    lat: 25.2048,
    lng: 55.2708,
    tz: "Asia/Dubai",
  },
  {
    id: "sin",
    label: "Singapore",
    country: "Singapore",
    lat: 1.3521,
    lng: 103.8198,
    tz: "Asia/Singapore",
  },
  {
    id: "tok",
    label: "Tokyo",
    country: "Japan",
    lat: 35.6762,
    lng: 139.6503,
    tz: "Asia/Tokyo",
  },
] as const;

export function searchCities(query: string): CityOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...TOP_CITIES];
  return TOP_CITIES.filter(
    (c) =>
      c.label.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.tz.toLowerCase().includes(q),
  );
}

export function cityDisplay(c: CityOption): string {
  return `${c.label}, ${c.country}`;
}
