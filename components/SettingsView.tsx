import type { UserProfile, SunSession } from "@/types";
import { SKIN_TYPES } from "@/lib/vitaminD";

export function SettingsView({ profile, sessions, onResetProfile }: {
  profile: UserProfile;
  sessions: SunSession[];
  onResetProfile: () => void;
}) {
  const skinTypeData = SKIN_TYPES[profile.skinType - 1];

  const stats = [
    { label: "Total sessions", value: sessions.length },
    { label: "Total vitamin D", value: `${sessions.reduce((s, x) => s + x.vitaminD, 0).toLocaleString()} IU` },
    { label: "Avg per session", value: sessions.length > 0 ? `${Math.round(sessions.reduce((s, x) => s + x.vitaminD, 0) / sessions.length).toLocaleString()} IU` : "—" },
  ];

  const profileRows = [
    { label: "Name", value: <span style={{ color: "var(--text)" }}>{profile.name}</span> },
    {
      label: "Skin type",
      value: (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ background: skinTypeData?.color }} />
          <span style={{ color: "var(--text)" }}>{skinTypeData?.label}</span>
        </div>
      ),
    },
    { label: "Body exposure", value: <span style={{ color: "var(--text)" }}>{profile.bodyExposure}%</span> },
    { label: "Age", value: <span style={{ color: "var(--text)" }}>{profile.age} yrs</span> },
    { label: "Weight", value: <span style={{ color: "var(--text)" }}>{profile.weight} kg</span> },
  ];

  return (
    <div className="animate-fade-up">
      <h2 className="font-display text-xl mb-4 md:hidden" style={{ color: "var(--text)" }}>Profile</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 max-w-4xl">
        <div className="glass rounded-2xl p-5 lg:p-6">
          <h3 className="text-sm font-medium mb-4" style={{ color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Your profile</h3>
          <div className="flex flex-col gap-3">
            {profileRows.map((row, i) => (
              <div
                key={row.label}
                className="flex justify-between items-center py-2"
                style={i < profileRows.length - 1 ? { borderBottom: "1px solid var(--border)" } : undefined}
              >
                <span style={{ color: "var(--text-muted)" }}>{row.label}</span>
                {row.value}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:gap-6">
          <div className="glass rounded-2xl p-5 lg:p-6">
            <h3 className="text-sm font-medium mb-4" style={{ color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Stats</h3>
            <div className="flex flex-col gap-3">
              {stats.map((stat) => (
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
        </div>
      </div>

      <p className="text-center md:text-left text-xs mt-6" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
        UV data from Open-Meteo · Solar calculations via SunCalc<br />
        Vitamin D estimates are approximate. Consult a doctor for medical advice.
      </p>
    </div>
  );
}
