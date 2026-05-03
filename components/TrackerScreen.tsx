"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { UserProfile, SunSession, AppLocation } from "@/types";
import { getSolarData } from "@/lib/vitaminD";
import { loadLocationPreferences, saveLocationPreferences, saveSessions, loadSessions } from "@/lib/storage";
import { fetchApproxCoordsFromClientNetworks } from "@/lib/clientGeoIp";
import { pushSync } from "@/lib/sync";
import { useAuth } from "@/contexts/AuthContext";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileNav } from "./MobileNav";
import { DashboardView } from "./DashboardView";
import { HistoryView } from "./HistoryView";
import { SettingsView } from "./SettingsView";

type View = "dashboard" | "history" | "settings";

function getGreeting(hour: number): string {
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

const VIEW_TITLES: Record<View, string> = {
  dashboard: "",
  history: "Session History",
  settings: "Profile & Settings",
};

export function TrackerScreen({ profile, onResetProfile }: { profile: UserProfile; onResetProfile: () => void }) {
  const { user } = useAuth();
  const profileRef = useRef(profile);
  profileRef.current = profile;
  const [location, setLocation] = useState<AppLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [solarData, setSolarData] = useState<ReturnType<typeof getSolarData> | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<number[]>([]);
  const [sessions, setSessions] = useState<SunSession[]>([]);
  const [activeSession, setActiveSession] = useState<SunSession | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [locPrefs, setLocPrefs] = useState(loadLocationPreferences);
  const locPrefsRef = useRef(locPrefs);
  locPrefsRef.current = locPrefs;
  const clockRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  useEffect(() => {
    clockRef.current = setInterval(() => {
      setCurrentTime(new Date());
      if (location) {
        setSolarData(getSolarData(location.lat, location.lng, profile, new Date()));
      }
    }, 60000);
    return () => clearInterval(clockRef.current);
  }, [location, profile]);

  const applyUvForCoords = useCallback(
    async (
      lat: number,
      lng: number,
      options?: { approximate?: boolean; cityHint?: string; source?: AppLocation["source"] }
    ) => {
    const p = profileRef.current;
    try {
      const res = await fetch(`/api/uv?lat=${lat}&lng=${lng}`);
      const data = (await res.json()) as {
        city?: string;
        hourlyForecast?: number[];
        currentUV?: number;
      };
      const loc: AppLocation = {
        lat,
        lng,
        city: data.city ?? options?.cityHint ?? "Your Location",
        approximate: options?.approximate,
        source: options?.source,
      };
      setLocation(loc);
      setHourlyForecast(data.hourlyForecast ?? []);
      const sd = getSolarData(lat, lng, p, new Date());
      if (data.currentUV != null) sd.uvIndex = data.currentUV;
      setSolarData(sd);
      setLocationError(null);
    } catch {
      setLocation({
        lat,
        lng,
        city: options?.cityHint ?? "Your Location",
        approximate: options?.approximate,
        source: options?.source,
      });
      setSolarData(getSolarData(lat, lng, p, new Date()));
      setLocationError(null);
    }
  }, []);

  /** Automatic: network/IP first (works on Safari iOS), then optional GPS refinement. */
  const requestLocation = useCallback(async () => {
    if (locPrefsRef.current.mode !== "auto") return;
    setLoading(true);
    setLocationError(null);

    let gotNetwork = false;
    try {
      const ipRes = await fetch("/api/locate");
      if (locPrefsRef.current.mode !== "auto") {
        setLoading(false);
        return;
      }
      if (ipRes.ok) {
        const ipData = (await ipRes.json()) as { lat?: number; lng?: number; city?: string };
        if (typeof ipData.lat === "number" && typeof ipData.lng === "number") {
          await applyUvForCoords(ipData.lat, ipData.lng, {
            approximate: true,
            cityHint: ipData.city,
            source: "ip",
          });
          gotNetwork = true;
        }
      }
    } catch {
      /* try client geo below */
    }

    if (locPrefsRef.current.mode !== "auto") {
      setLoading(false);
      return;
    }

    if (!gotNetwork) {
      try {
        const c = await fetchApproxCoordsFromClientNetworks();
        if (locPrefsRef.current.mode !== "auto") {
          setLoading(false);
          return;
        }
        if (c) {
          await applyUvForCoords(c.lat, c.lng, {
            approximate: true,
            cityHint: c.city,
            source: "ip",
          });
          gotNetwork = true;
        }
      } catch {
        /* GPS or error-only path */
      }
    }

    if (locPrefsRef.current.mode !== "auto") {
      setLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      if (!gotNetwork) {
        setLocationError(
          "Could not detect location. Try Settings → Manual, or another network."
        );
      }
      setLoading(false);
      return;
    }

    if (gotNetwork) setLoading(false);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (locPrefsRef.current.mode !== "auto") {
          setLoading(false);
          return;
        }
        const { latitude: lat, longitude: lng } = pos.coords;
        await applyUvForCoords(lat, lng, { approximate: false, source: "gps" });
        setLoading(false);
      },
      () => {
        if (locPrefsRef.current.mode !== "auto") {
          setLoading(false);
          return;
        }
        if (!gotNetwork) {
          setLocationError(
            "Location unavailable: GPS was blocked or timed out and network lookup failed (corporate firewall or strict privacy?). Use Settings · Location → Manual city or time zone."
          );
        }
        setLoading(false);
      },
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 14_000 }
    );
  }, [applyUvForCoords]);

  useEffect(() => {
    if (locPrefs.mode === "manual") {
      if (!locPrefs.manual) {
        setLocation(null);
        setSolarData(null);
        setHourlyForecast([]);
        setLocationError(
          "Choose your city or time zone under Settings · Location."
        );
        setLoading(false);
        return;
      }

      const m = locPrefs.manual;
      let cancelled = false;
      void (async () => {
        setLoading(true);
        setLocationError(null);
        await applyUvForCoords(m.lat, m.lng, {
          approximate: true,
          cityHint: m.city,
          source: "manual",
        });
        if (cancelled) return;
        if (
          locPrefsRef.current.mode !== "manual" ||
          locPrefsRef.current.manual?.lat !== m.lat ||
          locPrefsRef.current.manual?.lng !== m.lng
        ) {
          return;
        }
        setLoading(false);
      })();

      return () => {
        cancelled = true;
      };
    }

    void requestLocation();
    return undefined;
  }, [locPrefs.mode, locPrefs.manual, applyUvForCoords, requestLocation]);

  const handleStartSession = useCallback(() => {
    if (!location || !solarData) return;
    setActiveSession({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      startTime: Date.now(),
      vitaminD: 0,
      uvIndex: solarData.uvIndex,
      location,
      skinType: profile.skinType,
      bodyExposure: profile.bodyExposure,
    });
  }, [location, solarData, profile]);

  const handleStopSession = useCallback((completed: SunSession) => {
    setSessions((prev) => {
      const updated = [completed, ...prev];
      saveSessions(updated);
      if (user) void pushSync(profile, updated);
      return updated;
    });
    setActiveSession(null);
  }, [user, profile]);

  const today = new Date().toDateString();
  const todaySessions = sessions.filter((s) => new Date(s.startTime).toDateString() === today);
  const todayTotal = todaySessions.reduce((sum, s) => sum + s.vitaminD, 0);

  const desktopTitle = view === "dashboard"
    ? `Good ${getGreeting(currentTime.getHours())}, ${profile.name}`
    : VIEW_TITLES[view];

  return (
    <div className="min-h-screen flex w-full" style={{ background: "linear-gradient(160deg, #0a1628 0%, #112240 60%, #0a1628 100%)" }}>
      <DesktopSidebar view={view} setView={setView} profile={profile} location={location} currentTime={currentTime} />

      <div className="flex-1 min-h-screen flex flex-col min-w-0 w-full">
        {/* Mobile header */}
        <header className="flex md:hidden items-center justify-between w-full px-5 pt-6 pb-2 sm:px-6">
          <div>
            <h1 className="font-display text-xl" style={{ color: "var(--sun)" }}>Remind·D</h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {currentTime.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium" style={{ color: "var(--text)" }}>{profile.name}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{location?.city ?? "—"}</p>
          </div>
        </header>

        {/* Desktop header */}
        <header className="hidden md:flex items-center justify-between w-full max-w-content mx-auto px-8 lg:px-12 pt-8 pb-4">
          <div>
            <h2 className="font-display text-2xl lg:text-3xl" style={{ color: "var(--text)" }}>{desktopTitle}</h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {currentTime.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
              {location ? ` · ${location.city}` : ""}
            </p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto w-full px-5 sm:px-6 md:px-8 lg:px-12 pb-24 md:pb-8 pt-2">
          <div className="w-full max-w-content mx-auto">
          {view === "dashboard" && (
            <DashboardView
              solarData={solarData}
              loading={loading}
              locationError={locationError}
              location={location}
              activeSession={activeSession}
              hourlyForecast={hourlyForecast}
              todaySessions={todaySessions}
              todayTotal={todayTotal}
              currentTime={currentTime}
              useAutoLocation={locPrefs.mode === "auto"}
              onRequestLocation={requestLocation}
              onOpenLocationSettings={() => setView("settings")}
              onStartSession={handleStartSession}
              onStopSession={handleStopSession}
            />
          )}
          {view === "history" && <HistoryView sessions={sessions} />}
          {view === "settings" && (
            <SettingsView
              profile={profile}
              sessions={sessions}
              onResetProfile={onResetProfile}
              locationPreferences={locPrefs}
              onLocationPreferencesChange={(p) => {
                saveLocationPreferences(p);
                setLocPrefs(p);
              }}
            />
          )}
          </div>
        </main>

        <MobileNav view={view} setView={setView} />
      </div>
    </div>
  );
}
