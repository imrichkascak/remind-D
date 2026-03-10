"use client";

import { useState, useEffect } from "react";
import type { UserProfile } from "@/types";
import { saveProfile, loadProfile, saveSessions, loadSessions, loadSessionLocations } from "@/lib/storage";
import { pullSync, pushSync, mergeProfile, mergeSessions } from "@/lib/sync";
import { useAuth } from "@/contexts/AuthContext";
import { SunOrb } from "@/common";
import { SetupScreen } from "@/components/SetupScreen";
import { TrackerScreen } from "@/components/TrackerScreen";

export default function HomePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    const local = loadProfile();
    if (user) {
      pullSync().then(async ({ profile: syncedProfile, sessions: syncedSessions, error }) => {
        const mergedProfile = mergeProfile(syncedProfile, local?.name ?? "");
        const locations = loadSessionLocations();
        const mergedSessions = mergeSessions(syncedSessions, locations);
        if (mergedProfile) {
          saveProfile(mergedProfile);
          setProfile(mergedProfile);
        } else if (local) {
          setProfile(local);
        }
        saveSessions(mergedSessions);
        setLoaded(true);
        if (!syncedProfile && local) await pushSync(local, mergedSessions);
      });
    } else {
      setProfile(local);
      setLoaded(true);
    }
  }, [authLoading, user]);

  const handleComplete = async (p: UserProfile) => {
    saveProfile(p);
    setProfile(p);
    if (user) await pushSync(p, loadSessions());
  };

  const handleReset = () => {
    if (confirm("Reset all data? This cannot be undone.")) {
      localStorage.clear();
      setProfile(null);
    }
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-sun-pulse">
          <SunOrb altitude={45} isActive />
        </div>
      </div>
    );
  }

  if (!profile) return <SetupScreen onComplete={handleComplete} />;
  return <TrackerScreen profile={profile} onResetProfile={handleReset} />;
}
