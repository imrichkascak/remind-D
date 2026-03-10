import type { UserProfile, SunSession } from "@/types";
import type { SyncedProfile, SyncedSession } from "@/types/sync";
import { createClient } from "@/lib/supabase/client";

const SYNC_TABLE = "sync";

/** Strip PII: profile without name */
export function stripProfile(p: UserProfile): SyncedProfile {
  return {
    skinType: p.skinType,
    age: p.age,
    bodyExposure: p.bodyExposure,
    weight: p.weight,
  };
}

/** Strip PII: sessions without location */
export function stripSessions(sessions: SunSession[]): SyncedSession[] {
  return sessions.map((s) => ({
    id: s.id,
    date: s.date,
    startTime: s.startTime,
    endTime: s.endTime,
    vitaminD: s.vitaminD,
    uvIndex: s.uvIndex,
    skinType: s.skinType,
    bodyExposure: s.bodyExposure,
  }));
}

/** Merge synced profile with local name */
export function mergeProfile(
  synced: SyncedProfile | null,
  localName: string
): UserProfile | null {
  if (!synced) return null;
  return {
    ...synced,
    name: localName,
  };
}

const NO_LOCATION = { lat: 0, lng: 0, city: "—" };

/** Merge synced sessions with local locations (by session id) */
export function mergeSessions(
  synced: SyncedSession[],
  localLocations: Record<string, { lat: number; lng: number; city: string }>
): SunSession[] {
  return synced.map((s) => ({
    ...s,
    location: localLocations[s.id] ?? NO_LOCATION,
  }));
}

/** Push profile + sessions to server (no name, no location). */
export async function pushSync(
  profile: UserProfile,
  sessions: SunSession[]
): Promise<{ error: Error | null }> {
  const supabase = createClient();
  if (!supabase) return { error: new Error("Supabase not configured") };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Not signed in") }

  const { error } = await supabase
    .from(SYNC_TABLE)
    .upsert(
      {
        user_id: user.id,
        profile_json: stripProfile(profile),
        sessions_json: stripSessions(sessions),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  return { error: error ? new Error(error.message) : null };
}

/** Pull profile + sessions from server. */
export async function pullSync(): Promise<{
  profile: SyncedProfile | null;
  sessions: SyncedSession[];
  error: Error | null;
}> {
  const supabase = createClient();
  if (!supabase) {
    return { profile: null, sessions: [], error: new Error("Supabase not configured") };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { profile: null, sessions: [], error: new Error("Not signed in") };
  }

  const { data, error } = await supabase
    .from(SYNC_TABLE)
    .select("profile_json, sessions_json")
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return { profile: null, sessions: [], error: null };
    }
    return { profile: null, sessions: [], error: new Error(error.message) };
  }

  const profile = (data?.profile_json as SyncedProfile) ?? null;
  const sessions = (data?.sessions_json as SyncedSession[]) ?? [];
  return { profile, sessions, error: null };
}
