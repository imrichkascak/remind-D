import type { SunSession } from "@/types";
import { getUVCategory, formatTime, formatDuration } from "@/lib/vitaminD";

export function SessionCard({ session }: { session: SunSession }) {
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
