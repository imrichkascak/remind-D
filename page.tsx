"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { UserProfile, SunSession, SolarData } from "@/types";
import {
  getSolarData,
  calcVitaminDPerMinute,
  formatDuration,
  formatTime,
  getUVCategory,
  getDailyProgress,
  getRecommendedDaily,
  SKIN_TYPES,
  BODY_EXPOSURE_OPTIONS,
} from "@/lib/vitaminD";
import { saveProfile, loadProfile, saveSessions, loadSessions } from "@/lib/storage";

// ─── Sun Orb visual ───────────────────────────────────────────────────────────
function SunOrb({ altitude, isActive }: { altitude: number; isActive: boolean }) {
  const size = isActive ? 140 : 100;
  const opacity = Math.max(0.2, Math.min(1, (altitude + 10) / 60));
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer glow rings */}
      {isActive && (
        <>
          <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, transparent 40%, rgba(245,166,35,0.08) 70%, transparent 100%)", transform: "scale(2.5)", animation: "sun-pulse 3s ease-in-out infinite" }} />
          <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, transparent 40%, rgba(245,166,35,0.05) 70%, transparent 100%)", transform: "scale(3.5)", animation: "sun-pulse 3s ease-in-out 1s infinite" }} />
        </>
      )}
      {/* Sun core */}
      <div
        className="sun-orb absolute"
        style={{
          width: size,
          height: size,
          opacity,
          animation: isActive ? "sun-pulse 3s ease-in-out infinite" : "none",
          background: `radial-gradient(circle, #FFE566 0%, #F5A623 45%, #E07B00 75%, transparent 100%)`,
        }}
      />
      {/* Rays */}
      <div className="absolute" style={{ width: size * 1.6, height: size * 1.6, opacity: opacity * 0.4, animation: isActive ? "rays-spin 20s linear infinite" : "none" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="absolute" style={{
            width: 2,
            height: size * 0.3,
            background: "linear-gradient(to bottom, #FFD166, transparent)",
            top: "50%",
            left: "50%",
            transformOrigin: `1px ${-size * 0.6}px`,
            transform: `translateX(-50%) rotate(${i * 45}deg)`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── UV Bar Chart (hourly forecast) ──────────────────────────────────────────
function UVChart({ hourlyUV, currentHour }: { hourlyUV: number[]; currentHour: number }) {
  const max = Math.max(...hourlyUV, 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {hourlyUV.slice(0, 12).map((uv, i) => {
        const cat = getUVCategory(uv);
        const height = Math.max(4, (uv / max) * 56);
        const isCurrent = i === 0;
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div
              className="w-full rounded-sm transition-all"
              style={{
                height,
                background: isCurrent ? cat.color : `${cat.color}55`,
                border: isCurrent ? `1px solid ${cat.color}` : "none",
              }}
              title={`UV ${uv}`}
            />
            <span className="text-xs" style={{ color: "var(--text-muted)", fontSize: 9 }}>
              {(currentHour + i) % 24}h
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Setup Screen ─────────────────────────────────────────────────────────────
function SetupScreen({ onComplete }: { onComplete: (p: UserProfile) => void }) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    skinType: 3,
    age: 30,
    bodyExposure: 30,
    weight: 70,
    name: "",
  });

  const steps = [
    {
      title: "What's your name?",
      subtitle: "We'll personalize your experience",
      content: (
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Your name"
            value={profile.name ?? ""}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            className="w-full px-4 py-3 text-lg text-center"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              color: "var(--text)",
              outline: "none",
            }}
            autoFocus
          />
        </div>
      ),
    },
    {
      title: "Your skin type",
      subtitle: "Based on the Fitzpatrick scale",
      content: (
        <div className="grid grid-cols-3 gap-2">
          {SKIN_TYPES.map((st) => (
            <button
              key={st.type}
              onClick={() => setProfile((p) => ({ ...p, skinType: st.type }))}
              className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
              style={{
                background: profile.skinType === st.type ? "rgba(245,166,35,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${profile.skinType === st.type ? "var(--sun)" : "var(--border)"}`,
              }}
            >
              <div className="w-10 h-10 rounded-full" style={{ background: st.color }} />
              <span className="text-xs font-medium" style={{ color: "var(--text)" }}>{st.label}</span>
              <span className="text-xs text-center leading-tight" style={{ color: "var(--text-muted)", fontSize: 10 }}>{st.desc.split(",")[0]}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Body exposure",
      subtitle: "How much skin will be exposed to sun?",
      content: (
        <div className="flex flex-col gap-2">
          {BODY_EXPOSURE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setProfile((p) => ({ ...p, bodyExposure: opt.value }))}
              className="flex items-center gap-4 p-4 rounded-xl transition-all"
              style={{
                background: profile.bodyExposure === opt.value ? "rgba(245,166,35,0.12)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${profile.bodyExposure === opt.value ? "var(--sun)" : "var(--border)"}`,
              }}
            >
              <span className="text-2xl">{opt.icon}</span>
              <span style={{ color: "var(--text)" }}>{opt.label}</span>
              <span className="ml-auto text-sm" style={{ color: "var(--text-muted)" }}>{opt.value}% BSA</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Age & weight",
      subtitle: "Helps refine vitamin D estimates",
      content: (
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex justify-between mb-2">
              <span style={{ color: "var(--text-muted)" }}>Age</span>
              <span style={{ color: "var(--sun)" }} className="font-medium">{profile.age} years</span>
            </div>
            <input type="range" min={5} max={90} value={profile.age ?? 30}
              onChange={(e) => setProfile((p) => ({ ...p, age: +e.target.value }))}
              className="w-full" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span style={{ color: "var(--text-muted)" }}>Weight</span>
              <span style={{ color: "var(--sun)" }} className="font-medium">{profile.weight} kg</span>
            </div>
            <input type="range" min={30} max={150} value={profile.weight ?? 70}
              onChange={(e) => setProfile((p) => ({ ...p, weight: +e.target.value }))}
              className="w-full" />
          </div>
        </div>
      ),
    },
  ];

  const canNext = step === 0 ? (profile.name?.trim().length ?? 0) > 0 : true;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10" style={{ background: "linear-gradient(160deg, #0a1628 0%, #112240 50%, #0a1628 100%)" }}>
      {/* Logo */}
      <div className="mb-8 text-center animate-fade-up">
        <SunOrb altitude={45} isActive={false} />
        <h1 className="font-display text-3xl mt-4" style={{ color: "var(--sun)" }}>D·Minder</h1>
        <p style={{ color: "var(--text-muted)" }}>Vitamin D Sun Tracker</p>
      </div>

      <div className="w-full max-w-sm animate-fade-up-2">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <div key={i} className="rounded-full transition-all" style={{
              width: i === step ? 24 : 8,
              height: 8,
              background: i <= step ? "var(--sun)" : "rgba(255,255,255,0.1)",
            }} />
          ))}
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="font-display text-xl mb-1" style={{ color: "var(--text)" }}>{steps[step].title}</h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>{steps[step].subtitle}</p>
          {steps[step].content}
        </div>

        <div className="flex gap-3 mt-4">
          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)} className="flex-1 py-3 rounded-xl transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              Back
            </button>
          )}
          <button
            onClick={() => {
              if (step < steps.length - 1) setStep((s) => s + 1);
              else onComplete(profile as UserProfile);
            }}
            disabled={!canNext}
            className="flex-1 py-3 rounded-xl font-medium transition-all"
            style={{
              background: canNext ? "linear-gradient(135deg, var(--sun), var(--sun-deep))" : "rgba(255,255,255,0.06)",
              color: canNext ? "#000" : "var(--text-muted)",
              cursor: canNext ? "pointer" : "not-allowed",
              border: "none",
            }}
          >
            {step < steps.length - 1 ? "Continue →" : "Start Tracking ☀️"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Session Timer ─────────────────────────────────────────────────────────────
function SessionTimer({
  session,
  solarData,
  onStop,
}: {
  session: SunSession;
  solarData: SolarData | null;
  onStop: (s: SunSession) => void;
}) {
  const [elapsed, setElapsed] = useState(Date.now() - session.startTime);
  const [vitaminD, setVitaminD] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      const ms = Date.now() - session.startTime;
      setElapsed(ms);
      const mins = ms / 60000;
      setVitaminD(Math.round(session.vitaminD + (solarData?.vitaminDPerMinute ?? 0) * mins));
    }, 1000);
    return () => clearInterval(iv);
  }, [session, solarData]);

  const safeMs = (solarData?.safeMinutes ?? 30) * 60000;
  const pct = Math.min(100, (elapsed / safeMs) * 100);
  const isWarning = pct > 80;
  const isDanger = pct >= 100;

  return (
    <div className="glass-warm rounded-2xl p-5 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ background: isDanger ? "#f87171" : "#4ade80", animation: "sun-pulse 1s infinite" }} />
            <span className="text-xs font-medium uppercase tracking-widest" style={{ color: isDanger ? "#f87171" : "#4ade80" }}>
              {isDanger ? "Time to go inside!" : "Session active"}
            </span>
          </div>
          <span className="font-display text-4xl" style={{ color: "var(--sun)" }}>
            {formatDuration(elapsed)}
          </span>
        </div>
        <button
          onClick={() => onStop({ ...session, endTime: Date.now(), vitaminD })}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid var(--border)", color: "var(--text)" }}
        >
          Stop ◼
        </button>
      </div>

      {/* Safe time bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>
          <span>Safe exposure time</span>
          <span>{formatDuration(Math.max(0, safeMs - elapsed))} left</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${pct}%`,
              background: isDanger ? "linear-gradient(90deg, #f87171, #ef4444)" : isWarning ? "linear-gradient(90deg, #fb923c, #f97316)" : "linear-gradient(90deg, #4ade80, #22c55e)",
            }}
          />
        </div>
      </div>

      {/* Vitamin D accumulating */}
      <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(245,166,35,0.08)" }}>
        <span className="text-2xl">☀️</span>
        <div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>Vitamin D earned</div>
          <div className="font-medium" style={{ color: "var(--sun)" }}>{vitaminD.toLocaleString()} IU</div>
        </div>
        {solarData && (
          <div className="ml-auto text-right">
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>Rate</div>
            <div className="text-sm font-medium" style={{ color: "var(--sun)" }}>+{solarData.vitaminDPerMinute} IU/min</div>
          </div>
        )}
      </div>

      {isDanger && (
        <div className="mt-3 p-3 rounded-xl text-sm text-center" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
          ⚠️ You&apos;ve reached your safe exposure limit! Head inside to avoid burning.
        </div>
      )}
    </div>
  );
}

// ─── History entry ─────────────────────────────────────────────────────────────
function SessionCard({ session }: { session: SunSession }) {
  const duration = session.endTime ? session.endTime - session.startTime : 0;
  const date = new Date(session.startTime);
  const cat = getUVCategory(session.uvIndex);
  return (
    <div className="glass flex items-center gap-4 p-4 rounded-xl">
      <div className="text-2xl">☀️</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
            {date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${cat.color}22`, color: cat.color }}>
            UV {session.uvIndex}
          </span>
        </div>
        <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          {formatTime(date)} · {formatDuration(duration)} · {session.location.city}
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium" style={{ color: "var(--sun)" }}>{session.vitaminD.toLocaleString()} IU</div>
        <div className="text-xs" style={{ color: "var(--text-muted)" }}>vitamin D</div>
      </div>
    </div>
  );
}

// ─── Main Tracker Screen ───────────────────────────────────────────────────────
function TrackerScreen({ profile, onResetProfile }: { profile: UserProfile; onResetProfile: () => void }) {
  const [location, setLocation] = useState<{ lat: number; lng: number; city: string } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [solarData, setSolarData] = useState<SolarData | null>(null);
  const [uvFromAPI, setUvFromAPI] = useState<number | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<number[]>([]);
  const [sessions, setSessions] = useState<SunSession[]>([]);
  const [activeSession, setActiveSession] = useState<SunSession | null>(null);
  const [view, setView] = useState<"dashboard" | "history" | "settings">("dashboard");
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const clockRef = useRef<ReturnType<typeof setInterval>>();

  // Load sessions from storage
  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  // Clock tick
  useEffect(() => {
    clockRef.current = setInterval(() => {
      setCurrentTime(new Date());
      // Re-calculate solar data every minute
      if (location) {
        const sd = getSolarData(location.lat, location.lng, profile, new Date());
        setSolarData(sd);
      }
    }, 60000);
    return () => clearInterval(clockRef.current);
  }, [location, profile]);

  // Request geolocation
  const requestLocation = useCallback(() => {
    setLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await fetch(`/api/uv?lat=${lat}&lng=${lng}`);
          const data = await res.json();
          const loc = { lat, lng, city: data.city ?? "Your Location" };
          setLocation(loc);
          setUvFromAPI(data.currentUV ?? null);
          setHourlyForecast(data.hourlyForecast ?? []);

          // Compute solar data, potentially override UV with API value
          const sd = getSolarData(lat, lng, profile, new Date());
          if (data.currentUV != null) sd.uvIndex = data.currentUV;
          setSolarData(sd);
        } catch {
          const loc = { lat, lng, city: "Your Location" };
          setLocation(loc);
          setSolarData(getSolarData(lat, lng, profile, new Date()));
        }
        setLoading(false);
      },
      (err) => {
        setLocationError("Location access denied. Please allow location permissions.");
        setLoading(false);
      }
    );
  }, [profile]);

  // Auto-request on mount
  useEffect(() => {
    requestLocation();
  }, []); // eslint-disable-line

  const handleStartSession = useCallback(() => {
    if (!location || !solarData) return;
    const vitaminDPerMin = calcVitaminDPerMinute(
      solarData.uvIndex,
      profile.skinType,
      profile.bodyExposure,
      solarData.sunAltitude
    );
    const newSession: SunSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      startTime: Date.now(),
      vitaminD: 0,
      uvIndex: solarData.uvIndex,
      location,
      skinType: profile.skinType,
      bodyExposure: profile.bodyExposure,
    };
    setActiveSession(newSession);
  }, [location, solarData, profile]);

  const handleStopSession = useCallback((completed: SunSession) => {
    setSessions((prev) => {
      const updated = [completed, ...prev];
      saveSessions(updated);
      return updated;
    });
    setActiveSession(null);
  }, []);

  // Today's totals
  const today = new Date().toDateString();
  const todaySessions = sessions.filter((s) => new Date(s.startTime).toDateString() === today);
  const todayTotal = todaySessions.reduce((sum, s) => sum + s.vitaminD, 0) + (activeSession ? 0 : 0);
  const progress = getDailyProgress(todayTotal);
  const uvCat = getUVCategory(solarData?.uvIndex ?? 0);
  const skinTypeData = SKIN_TYPES[profile.skinType - 1];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(160deg, #0a1628 0%, #112240 60%, #0a1628 100%)", maxWidth: 480, margin: "0 auto" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-6 pb-2">
        <div>
          <h1 className="font-display text-xl" style={{ color: "var(--sun)" }}>D·Minder</h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {currentTime.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium" style={{ color: "var(--text)" }}>{profile.name}</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {location?.city ?? "—"}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-5 pb-24 pt-2">
        {view === "dashboard" && (
          <div className="flex flex-col gap-4">
            {/* Sun + UV hero */}
            <div className="glass rounded-2xl p-5 text-center animate-fade-up">
              <div className="flex justify-center mb-2">
                <SunOrb altitude={solarData?.sunAltitude ?? 0} isActive={solarData?.isOptimal ?? false} />
              </div>

              {loading && (
                <p style={{ color: "var(--text-muted)" }}>Detecting location…</p>
              )}
              {locationError && (
                <div>
                  <p className="text-sm mb-2" style={{ color: "#f87171" }}>{locationError}</p>
                  <button onClick={requestLocation} className="text-sm underline" style={{ color: "var(--sun)" }}>Try again</button>
                </div>
              )}

              {solarData && !loading && (
                <>
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <span className="font-display text-5xl" style={{ color: uvCat.color }}>
                      {solarData.uvIndex.toFixed(1)}
                    </span>
                    <div className="text-left">
                      <div className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>UV Index</div>
                      <div className="font-medium" style={{ color: uvCat.color }}>{uvCat.label}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                    <span>🌅 {formatTime(solarData.sunrise)}</span>
                    <span>☀️ {formatTime(solarData.solarNoon)}</span>
                    <span>🌇 {formatTime(solarData.sunset)}</span>
                  </div>

                  {solarData.isOptimal ? (
                    <div className="mt-3 p-2 rounded-xl text-sm" style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", color: "#4ade80" }}>
                      ✦ Now is a great time to get your vitamin D!
                    </div>
                  ) : solarData.sunAltitude < 10 ? (
                    <div className="mt-3 p-2 rounded-xl text-sm" style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-muted)" }}>
                      Sun is too low for vitamin D synthesis right now.
                    </div>
                  ) : (
                    <div className="mt-3 p-2 rounded-xl text-sm" style={{ background: "rgba(245,166,35,0.06)", color: "var(--text-muted)" }}>
                      Low UV — some synthesis possible, but limited.
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Active session */}
            {activeSession && solarData && (
              <SessionTimer session={activeSession} solarData={solarData} onStop={handleStopSession} />
            )}

            {/* Stats row */}
            {solarData && !activeSession && (
              <div className="grid grid-cols-3 gap-3 animate-fade-up-2">
                {[
                  { label: "Sun altitude", value: `${solarData.sunAltitude}°`, icon: "📐" },
                  { label: "Safe time", value: solarData.uvIndex > 0 ? `${solarData.safeMinutes}m` : "∞", icon: "⏱" },
                  { label: "D3 rate", value: solarData.vitaminDPerMinute > 0 ? `+${solarData.vitaminDPerMinute} IU` : "0", icon: "💊" },
                ].map((stat) => (
                  <div key={stat.label} className="glass rounded-xl p-3 text-center">
                    <div className="text-xl mb-1">{stat.icon}</div>
                    <div className="font-medium text-sm" style={{ color: "var(--text)" }}>{stat.value}</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Today's vitamin D progress */}
            <div className="glass rounded-2xl p-5 animate-fade-up-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium" style={{ color: "var(--text)" }}>Today&apos;s Vitamin D</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Goal: {getRecommendedDaily()} IU</span>
              </div>
              <div className="flex items-end gap-2 mb-3">
                <span className="font-display text-3xl" style={{ color: "var(--sun)" }}>{todayTotal.toLocaleString()}</span>
                <span className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>IU</span>
                <span className="ml-auto text-sm font-medium" style={{ color: progress >= 100 ? "#4ade80" : "var(--sun)" }}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background: progress >= 100 ? "linear-gradient(90deg, #4ade80, #22c55e)" : "linear-gradient(90deg, var(--sun-bright), var(--sun), var(--horizon))",
                  }}
                />
              </div>
              {progress >= 100 && (
                <p className="text-xs mt-2" style={{ color: "#4ade80" }}>🎉 Daily goal reached!</p>
              )}
            </div>

            {/* UV hourly forecast */}
            {hourlyForecast.length > 0 && (
              <div className="glass rounded-2xl p-5 animate-fade-up-4">
                <p className="text-sm font-medium mb-3" style={{ color: "var(--text)" }}>UV Forecast</p>
                <UVChart hourlyUV={hourlyForecast} currentHour={currentTime.getHours()} />
              </div>
            )}

            {/* Start session button */}
            {!activeSession && solarData && location && (
              <button
                onClick={handleStartSession}
                disabled={solarData.uvIndex < 0.5}
                className="w-full py-4 rounded-2xl font-medium text-lg transition-all"
                style={{
                  background: solarData.uvIndex >= 0.5 ? "linear-gradient(135deg, #F5A623, #E07B00)" : "rgba(255,255,255,0.06)",
                  color: solarData.uvIndex >= 0.5 ? "#000" : "var(--text-muted)",
                  border: "none",
                  cursor: solarData.uvIndex >= 0.5 ? "pointer" : "not-allowed",
                  boxShadow: solarData.uvIndex >= 0.5 ? "0 8px 32px rgba(245,166,35,0.3)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {solarData.uvIndex >= 0.5 ? "☀️  Start Sun Session" : "🌑  No UV right now"}
              </button>
            )}

            {/* Recent sessions */}
            {todaySessions.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: "var(--text-muted)" }}>Today&apos;s sessions</p>
                <div className="flex flex-col gap-2">
                  {todaySessions.slice(0, 3).map((s) => <SessionCard key={s.id} session={s} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {view === "history" && (
          <div className="flex flex-col gap-3 animate-fade-up">
            <h2 className="font-display text-xl mb-2" style={{ color: "var(--text)" }}>Session History</h2>
            {sessions.length === 0 ? (
              <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
                <div className="text-5xl mb-4">☀️</div>
                <p>No sessions yet. Go outside!</p>
              </div>
            ) : (
              sessions.map((s) => <SessionCard key={s.id} session={s} />)
            )}
          </div>
        )}

        {view === "settings" && (
          <div className="flex flex-col gap-4 animate-fade-up">
            <h2 className="font-display text-xl mb-2" style={{ color: "var(--text)" }}>Profile</h2>

            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-medium mb-4" style={{ color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Your profile</h3>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--text-muted)" }}>Name</span>
                  <span style={{ color: "var(--text)" }}>{profile.name}</span>
                </div>
                <div className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--text-muted)" }}>Skin type</span>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ background: skinTypeData?.color }} />
                    <span style={{ color: "var(--text)" }}>{skinTypeData?.label}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--text-muted)" }}>Body exposure</span>
                  <span style={{ color: "var(--text)" }}>{profile.bodyExposure}%</span>
                </div>
                <div className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--text-muted)" }}>Age</span>
                  <span style={{ color: "var(--text)" }}>{profile.age} yrs</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span style={{ color: "var(--text-muted)" }}>Weight</span>
                  <span style={{ color: "var(--text)" }}>{profile.weight} kg</span>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-medium mb-4" style={{ color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Stats</h3>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Total sessions", value: sessions.length },
                  { label: "Total vitamin D", value: `${sessions.reduce((s, x) => s + x.vitaminD, 0).toLocaleString()} IU` },
                  { label: "Avg per session", value: sessions.length > 0 ? `${Math.round(sessions.reduce((s, x) => s + x.vitaminD, 0) / sessions.length).toLocaleString()} IU` : "—" },
                ].map((stat) => (
                  <div key={stat.label} className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--text-muted)" }}>{stat.label}</span>
                    <span style={{ color: "var(--sun)" }} className="font-medium">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onResetProfile}
              className="w-full py-3 rounded-xl text-sm transition-all"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", cursor: "pointer" }}
            >
              Reset profile & data
            </button>

            <p className="text-center text-xs" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
              UV data from Open-Meteo · Solar calculations via SunCalc<br />
              Vitamin D estimates are approximate. Consult a doctor for medical advice.
            </p>
          </div>
        )}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-5 pb-4 pt-2"
        style={{ background: "linear-gradient(to top, #0a1628 80%, transparent)" }}>
        <div className="glass rounded-2xl flex">
          {(["dashboard", "history", "settings"] as const).map((v) => {
            const icons = { dashboard: "☀️", history: "📋", settings: "⚙️" };
            const labels = { dashboard: "Today", history: "History", settings: "Profile" };
            return (
              <button
                key={v}
                onClick={() => setView(v)}
                className="flex-1 py-3 flex flex-col items-center gap-1 transition-all rounded-2xl"
                style={{
                  background: view === v ? "rgba(245,166,35,0.12)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <span>{icons[v]}</span>
                <span className="text-xs" style={{ color: view === v ? "var(--sun)" : "var(--text-muted)" }}>{labels[v]}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// ─── Root app ──────────────────────────────────────────────────────────────────
export default function App() {
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
