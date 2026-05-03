import type { AppLocation, UserProfile } from "@/types";

type View = "dashboard" | "history" | "settings";

const NAV_ITEMS: { key: View; icon: string; label: string }[] = [
  { key: "dashboard", icon: "☀️", label: "Dashboard" },
  { key: "history", icon: "📋", label: "History" },
  { key: "settings", icon: "⚙️", label: "Settings" },
];

export function DesktopSidebar({ view, setView, profile, location, currentTime }: {
  view: View;
  setView: (v: View) => void;
  profile: UserProfile;
  location: AppLocation | null;
  currentTime: Date;
}) {
  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 h-screen sticky top-0 border-r" style={{ background: "rgba(10,22,40,0.6)", borderColor: "var(--border)" }}>
      <div className="px-6 pt-8 pb-6">
        <h1 className="font-display text-2xl" style={{ color: "var(--sun)" }}>Remind·D</h1>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Vitamin D Sun Tracker</p>
      </div>

      <nav className="flex-1 px-3">
        {NAV_ITEMS.map((item) => (
          <button
            type="button"
            key={item.key}
            onClick={() => setView(item.key)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all text-left"
            aria-current={view === item.key ? "page" : undefined}
            aria-label={item.label}
            style={{
              background: view === item.key ? "rgba(245,166,35,0.12)" : "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm font-medium" style={{ color: view === item.key ? "var(--sun)" : "var(--text-muted)" }}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="px-6 py-6 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium" style={{ background: "rgba(245,166,35,0.15)", color: "var(--sun)" }}>
            {profile.name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{profile.name}</p>
            <p
              className="text-xs truncate"
              style={{ color: "var(--text-muted)" }}
              title={
                location?.source === "manual"
                  ? "Manual location"
                  : location?.approximate
                    ? "Approximate (network)"
                    : undefined
              }
            >
              {location?.city ?? "—"}
              {location?.source === "manual" ? " · ✎" : location?.approximate ? " · ~" : ""}
            </p>
          </div>
        </div>
        <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
          {currentTime.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>
    </aside>
  );
}
