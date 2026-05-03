import type { LocationPreferences, UserProfile, SunSession } from "@/types";

const PROFILE_KEY = "remindd_profile";
const SESSIONS_KEY = "remindd_sessions";
const SESSION_LOCATIONS_KEY = "remindd_session_locations";
const LOCATION_PREFS_KEY = "remindd_location_prefs";

const DEFAULT_LOCATION_PREFS: LocationPreferences = { mode: "auto", manual: null };

export function loadLocationPreferences(): LocationPreferences {
  if (typeof window === "undefined") return DEFAULT_LOCATION_PREFS;
  try {
    const raw = localStorage.getItem(LOCATION_PREFS_KEY);
    if (!raw) return DEFAULT_LOCATION_PREFS;
    const p = JSON.parse(raw) as LocationPreferences;
    if (p?.mode === "manual" && p.manual && typeof p.manual.lat === "number" && typeof p.manual.lng === "number") {
      return {
        mode: "manual",
        manual: {
          lat: p.manual.lat,
          lng: p.manual.lng,
          city: typeof p.manual.city === "string" ? p.manual.city : "Your place",
          timezone: typeof p.manual.timezone === "string" ? p.manual.timezone : undefined,
        },
      };
    }
    if (p?.mode === "auto") return { mode: "auto", manual: null };
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCATION_PREFS;
}

export function saveLocationPreferences(prefs: LocationPreferences): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCATION_PREFS_KEY, JSON.stringify(prefs));
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSessions(sessions: SunSession[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  const locations: Record<string, { lat: number; lng: number; city: string }> = {};
  for (const s of sessions) {
    if (s.location && (s.location.lat !== 0 || s.location.lng !== 0 || s.location.city !== "—")) {
      locations[s.id] = s.location;
    }
  }
  localStorage.setItem(SESSION_LOCATIONS_KEY, JSON.stringify(locations));
}

export function loadSessions(): SunSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function loadSessionLocations(): Record<string, { lat: number; lng: number; city: string }> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SESSION_LOCATIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function clearAll(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(SESSIONS_KEY);
  localStorage.removeItem(SESSION_LOCATIONS_KEY);
  localStorage.removeItem(LOCATION_PREFS_KEY);
}
