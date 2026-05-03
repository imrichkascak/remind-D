import type { SunSession } from "@/types";
import { getUVCategory, formatTime, formatDuration } from "@/lib/vitaminD";

export function SessionCard({ session, onDelete }: { session: SunSession; onDelete?: () => void }) {
  const duration = session.endTime ? session.endTime - session.startTime : 0;
  const date = new Date(session.startTime);
  const cat = getUVCategory(session.uvIndex);
  const handleRemove = () => {
    if (confirm("Remove this session from your history? This cannot be undone.")) {
      onDelete?.();
    }
  };
  return (
    <div className="glass flex items-center gap-3 sm:gap-4 p-4 rounded-xl">
      <div className="text-2xl shrink-0">☀️</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
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
      <div className="text-right shrink-0">
        <div className="font-medium" style={{ color: "var(--sun)" }}>{session.vitaminD.toLocaleString()} IU</div>
        <div className="text-xs" style={{ color: "var(--text-muted)" }}>vitamin D</div>
      </div>
      {onDelete && (
        <button
          type="button"
          onClick={handleRemove}
          className="shrink-0 w-9 h-9 rounded-lg text-lg leading-none flex items-center justify-center transition-opacity hover:opacity-90"
          style={{
            color: "#f87171",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            cursor: "pointer",
          }}
          title="Remove session"
          aria-label="Remove session"
        >
          ×
        </button>
      )}
    </div>
  );
}
