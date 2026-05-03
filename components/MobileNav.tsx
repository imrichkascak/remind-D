type View = "dashboard" | "history" | "settings";

const NAV_ITEMS: { key: View; icon: string; label: string }[] = [
  { key: "dashboard", icon: "☀️", label: "Today" },
  { key: "history", icon: "📋", label: "History" },
  { key: "settings", icon: "⚙️", label: "Profile" },
];

export function MobileNav({
  view,
  setView,
  startSession,
}: {
  view: View;
  setView: (v: View) => void;
  startSession?: { onPress: () => void; lowUv: boolean } | null;
}) {
  const hasStart = Boolean(startSession);

  return (
    <nav
      className="fixed md:hidden bottom-0 left-0 right-0 px-4 sm:px-5 pb-4 pt-2 flex justify-center"
      style={{ background: "linear-gradient(to top, #0a1628 80%, transparent)" }}
    >
      <div
        className={`glass rounded-2xl w-full max-w-md ${hasStart ? "flex flex-col gap-2 p-2" : "flex"}`}
      >
        {startSession && (
          <button
            type="button"
            onClick={startSession.onPress}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 px-4 font-semibold text-sm shrink-0"
            style={{
              background: startSession.lowUv
                ? "linear-gradient(135deg, #c98a1c, #a86a00)"
                : "linear-gradient(135deg, #F5A623, #E07B00)",
              color: "#000",
              border: "none",
              boxShadow: startSession.lowUv
                ? "0 8px 24px rgba(245,166,35,0.22)"
                : "0 8px 32px rgba(245,166,35,0.3)",
              cursor: "pointer",
            }}
            aria-label={
              startSession.lowUv
                ? "Start session anytime despite low modeled UV"
                : "Start session"
            }
          >
            <span className="text-lg leading-none" aria-hidden>☀️</span>
            <span className="whitespace-nowrap">
              {startSession.lowUv ? "Start session (any time)" : "Start session"}
            </span>
          </button>
        )}

        <div className="flex w-full">
          {NAV_ITEMS.map((item) => (
            <button
              type="button"
              key={item.key}
              onClick={() => setView(item.key)}
              className="flex-1 py-3 flex flex-col items-center gap-1 transition-all rounded-2xl"
              aria-current={view === item.key ? "page" : undefined}
              aria-label={item.label}
              style={{
                background: view === item.key ? "rgba(245,166,35,0.12)" : "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              <span>{item.icon}</span>
              <span
                className="text-xs"
                style={{ color: view === item.key ? "var(--sun)" : "var(--text-muted)" }}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
