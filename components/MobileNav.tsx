type View = "dashboard" | "history" | "settings";

const NAV_ITEMS: { key: View; icon: string; label: string }[] = [
  { key: "dashboard", icon: "☀️", label: "Today" },
  { key: "history", icon: "📋", label: "History" },
  { key: "settings", icon: "⚙️", label: "Profile" },
];

export function MobileNav({ view, setView }: { view: View; setView: (v: View) => void }) {
  return (
    <nav className="fixed md:hidden bottom-0 left-0 right-0 px-5 pb-4 pt-2"
      style={{ background: "linear-gradient(to top, #0a1628 80%, transparent)" }}>
      <div className="glass rounded-2xl flex">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => setView(item.key)}
            className="flex-1 py-3 flex flex-col items-center gap-1 transition-all rounded-2xl"
            style={{
              background: view === item.key ? "rgba(245,166,35,0.12)" : "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span>{item.icon}</span>
            <span className="text-xs" style={{ color: view === item.key ? "var(--sun)" : "var(--text-muted)" }}>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
