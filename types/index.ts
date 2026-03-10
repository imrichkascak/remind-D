export interface UserProfile {
  skinType: number; // 1-6 Fitzpatrick scale
  age: number;
  bodyExposure: number; // 0-100 percent
  weight: number; // kg
  name: string;
}

export interface SunSession {
  id: string;
  date: string; // ISO
  startTime: number; // unix ms
  endTime?: number;
  vitaminD: number; // IU
  uvIndex: number;
  location: { lat: number; lng: number; city: string };
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
