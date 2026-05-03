export interface UserProfile {
  skinType: number; // 1-6 Fitzpatrick scale
  age: number;
  bodyExposure: number; // 0-100 percent
  weight: number; // kg
  name: string;
}

/** How coordinates were obtained (for UI hints). */
export type LocationSource = "gps" | "ip" | "manual";

/** Session / UI location; approximate when not from device GPS. */
export interface AppLocation {
  lat: number;
  lng: number;
  city: string;
  approximate?: boolean;
  source?: LocationSource;
}

/** User-chosen place for manual mode (persists in localStorage). */
export interface ManualLocationPick {
  lat: number;
  lng: number;
  city: string;
  /** IANA zone if set via time zone picker */
  timezone?: string;
}

export interface LocationPreferences {
  mode: "auto" | "manual";
  manual: ManualLocationPick | null;
}

export interface SunSession {
  id: string;
  date: string; // ISO
  startTime: number; // unix ms
  endTime?: number;
  vitaminD: number; // IU
  uvIndex: number;
  location: AppLocation;
  skinType: number;
  bodyExposure: number;
}

export interface SolarData {
  uvIndex: number;
  solarNoon: Date;
  sunrise: Date;
  sunset: Date;
  sunAltitude: number; // degrees
  isOptimal: boolean;
  safeMinutes: number; // minutes before burn risk
  vitaminDPerMinute: number; // IU per minute
}

export interface AppState {
  profile: UserProfile | null;
  sessions: SunSession[];
  activeSession: SunSession | null;
  todayTotal: number; // IU
}
