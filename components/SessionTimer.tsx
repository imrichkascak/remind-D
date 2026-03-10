"use client";

import { useState, useEffect } from "react";
import type { SunSession, SolarData } from "@/types";
import { formatDuration } from "@/lib/vitaminD";

export function SessionTimer({
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
