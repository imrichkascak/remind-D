import type { SunSession } from "@/types";
import { SessionCard } from "./SessionCard";

export function HistoryView({ sessions }: { sessions: SunSession[] }) {
  return (
    <div className="animate-fade-up">
      <h2 className="font-display text-xl mb-4 md:hidden" style={{ color: "var(--text)" }}>Session History</h2>
      {sessions.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
          <div className="text-5xl mb-4">☀️</div>
          <p>No sessions yet. Go outside!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
          {sessions.map((s) => <SessionCard key={s.id} session={s} />)}
        </div>
      )}
    </div>
  );
}
