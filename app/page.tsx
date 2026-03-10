"use client";

import { useState, useEffect } from "react";
import type { UserProfile } from "@/types";
import { saveProfile, loadProfile } from "@/lib/storage";
import { SunOrb } from "@/common";
import { SetupScreen } from "@/components/SetupScreen";
import { TrackerScreen } from "@/components/TrackerScreen";

export default function HomePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    setLoaded(true);
  }, []);

  const handleComplete = (p: UserProfile) => {
    saveProfile(p);
    setProfile(p);
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
