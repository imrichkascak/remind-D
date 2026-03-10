import type { SunSession, SolarData } from "@/types";
import { formatTime, getUVCategory, getDailyProgress, getRecommendedDaily } from "@/lib/vitaminD";
import { SunOrb, UVChart } from "@/common";
import { SessionTimer } from "./SessionTimer";
import { SessionCard } from "./SessionCard";

function StartSessionButton({ solarData, onClick, className }: {
  solarData: SolarData;
  onClick: () => void;
  className?: string;
}) {
  const enabled = solarData.uvIndex >= 0.5;
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      className={`w-full py-4 rounded-2xl font-medium text-lg transition-all ${className ?? ""}`}
      style={{
        background: enabled ? "linear-gradient(135deg, #F5A623, #E07B00)" : "rgba(255,255,255,0.06)",
        color: enabled ? "#000" : "var(--text-muted)",
        border: "none",
        cursor: enabled ? "pointer" : "not-allowed",
        boxShadow: enabled ? "0 8px 32px rgba(245,166,35,0.3)" : "none",
        transition: "all 0.2s",
      }}
    >
      {enabled ? "☀️  Start Sun Session" : "🌑  No UV right now"}
    </button>
  );
}

function SunStatusBanner({ solarData }: { solarData: SolarData }) {
  if (solarData.isOptimal) {
    return (
      <div className="mt-3 p-2 rounded-xl text-sm" style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", color: "#4ade80" }}>
        ✦ Now is a great time to get your vitamin D!
      </div>
    );
  }
  if (solarData.sunAltitude < 10) {
    return (
      <div className="mt-3 p-2 rounded-xl text-sm" style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-muted)" }}>
        Sun is too low for vitamin D synthesis right now.
      </div>
    );
  }
  return (
    <div className="mt-3 p-2 rounded-xl text-sm" style={{ background: "rgba(245,166,35,0.06)", color: "var(--text-muted)" }}>
      Low UV — some synthesis possible, but limited.
    </div>
  );
}

function DailyProgressCard({ todayTotal, progress }: { todayTotal: number; progress: number }) {
  return (
    <div className="glass rounded-2xl p-5 lg:p-6 animate-fade-up-3">
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
  );
}

function QuickStats({ solarData }: { solarData: SolarData }) {
  const stats = [
    { label: "Sun altitude", value: `${solarData.sunAltitude}°`, icon: "📐" },
    { label: "Safe time", value: solarData.uvIndex > 0 ? `${solarData.safeMinutes}m` : "∞", icon: "⏱" },
    { label: "D3 rate", value: solarData.vitaminDPerMinute > 0 ? `+${solarData.vitaminDPerMinute} IU` : "0", icon: "💊" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 animate-fade-up-2">
      {stats.map((stat) => (
        <div key={stat.label} className="glass rounded-xl p-3 lg:p-4 text-center">
          <div className="text-xl mb-1">{stat.icon}</div>
          <div className="font-medium text-sm" style={{ color: "var(--text)" }}>{stat.value}</div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

export function DashboardView({
  solarData,
  loading,
  locationError,
  location,
  activeSession,
  hourlyForecast,
  todaySessions,
  todayTotal,
  currentTime,
  onRequestLocation,
  onStartSession,
  onStopSession,
}: {
  solarData: SolarData | null;
  loading: boolean;
  locationError: string | null;
  location: { lat: number; lng: number; city: string } | null;
  activeSession: SunSession | null;
  hourlyForecast: number[];
  todaySessions: SunSession[];
  todayTotal: number;
  currentTime: Date;
  onRequestLocation: () => void;
  onStartSession: () => void;
  onStopSession: (s: SunSession) => void;
}) {
  const progress = getDailyProgress(todayTotal);
  const uvCat = getUVCategory(solarData?.uvIndex ?? 0);

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* UV Index card */}
        <div className="glass rounded-2xl p-5 lg:p-8 text-center animate-fade-up">
          <div className="flex justify-center mb-2">
            <SunOrb altitude={solarData?.sunAltitude ?? 0} isActive={solarData?.isOptimal ?? false} />
          </div>

          {loading && (
            <p style={{ color: "var(--text-muted)" }}>Detecting location…</p>
          )}
          {locationError && (
            <div>
              <p className="text-sm mb-2" style={{ color: "#f87171" }}>{locationError}</p>
              <button onClick={onRequestLocation} className="text-sm underline" style={{ color: "var(--sun)" }}>Try again</button>
            </div>
          )}

          {solarData && !loading && (
            <>
              <div className="flex items-center justify-center gap-3 mb-1">
                <span className="font-display text-5xl lg:text-6xl" style={{ color: uvCat.color }}>
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

              <SunStatusBanner solarData={solarData} />
            </>
          )}
        </div>

        {/* Right column: stats + progress + CTA */}
        <div className="flex flex-col gap-4 lg:gap-6">
          {solarData && !activeSession && <QuickStats solarData={solarData} />}
          <DailyProgressCard todayTotal={todayTotal} progress={progress} />
          {!activeSession && solarData && location && (
            <StartSessionButton solarData={solarData} onClick={onStartSession} className="hidden lg:block animate-fade-up-4" />
          )}
        </div>
      </div>

      {activeSession && solarData && (
        <div className="w-full max-w-xl lg:max-w-2xl mx-auto">
          <SessionTimer session={activeSession} solarData={solarData} onStop={onStopSession} />
        </div>
      )}

      {/* Forecast + today's sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {hourlyForecast.length > 0 && (
          <div className="glass rounded-2xl p-5 lg:p-6 animate-fade-up-4">
            <p className="text-sm font-medium mb-3" style={{ color: "var(--text)" }}>UV Forecast</p>
            <UVChart hourlyUV={hourlyForecast} currentHour={currentTime.getHours()} />
          </div>
        )}

        {todaySessions.length > 0 && (
          <div className="animate-fade-up-4">
            <p className="text-sm font-medium mb-2" style={{ color: "var(--text-muted)" }}>Today&apos;s sessions</p>
            <div className="flex flex-col gap-2">
              {todaySessions.slice(0, 3).map((s) => <SessionCard key={s.id} session={s} />)}
            </div>
          </div>
        )}
      </div>

      {/* Mobile-only start session button */}
      {!activeSession && solarData && location && (
        <StartSessionButton solarData={solarData} onClick={onStartSession} className="lg:hidden" />
      )}
    </div>
  );
}
