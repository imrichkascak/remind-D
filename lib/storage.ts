import type { UserProfile, SunSession } from "@/types";

const PROFILE_KEY = "remindd_profile";
const SESSIONS_KEY = "remindd_sessions";
const SESSION_LOCATIONS_KEY = "remindd_session_locations";

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
}
