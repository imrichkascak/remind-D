/**
 * Data shapes sent to / received from the server.
 * Never include: name, location (lat, lng, city).
 */

export interface SyncedProfile {
  skinType: number;
  age: number;
  bodyExposure: number;
  weight: number;
}

export interface SyncedSession {
  id: string;
  date: string;
  startTime: number;
  endTime?: number;
  vitaminD: number;
  uvIndex: number;
  skinType: number;
  bodyExposure: number;
}

export interface SyncRow {
  profile_json: SyncedProfile | null;
  sessions_json: SyncedSession[];
  updated_at: string;
}
