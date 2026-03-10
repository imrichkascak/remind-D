"use client";

import { useState } from "react";
import type { UserProfile } from "@/types";
import { SKIN_TYPES, BODY_EXPOSURE_OPTIONS } from "@/lib/vitaminD";
import { SunOrb } from "@/common";

export function SetupScreen({ onComplete }: { onComplete: (p: UserProfile) => void }) {
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
            }}
            aria-label="Your name"
            autoFocus
          />
        </div>
      ),
    },
    {
      title: "Your skin type",
      subtitle: "Based on the Fitzpatrick scale",
      content: (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {SKIN_TYPES.map((st) => (
            <button
              type="button"
              key={st.type}
              onClick={() => setProfile((p) => ({ ...p, skinType: st.type }))}
              className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
              aria-pressed={profile.skinType === st.type}
              aria-label={st.label}
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
              type="button"
              key={opt.value}
              onClick={() => setProfile((p) => ({ ...p, bodyExposure: opt.value }))}
              className="flex items-center gap-4 p-4 rounded-xl transition-all"
              aria-pressed={profile.bodyExposure === opt.value}
              aria-label={`${opt.label}, ${opt.value}% BSA`}
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
              className="w-full" aria-label="Age in years" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span style={{ color: "var(--text-muted)" }}>Weight</span>
              <span style={{ color: "var(--sun)" }} className="font-medium">{profile.weight} kg</span>
            </div>
            <input type="range" min={30} max={150} value={profile.weight ?? 70}
              onChange={(e) => setProfile((p) => ({ ...p, weight: +e.target.value }))}
              className="w-full" aria-label="Weight in kg" />
          </div>
        </div>
      ),
    },
  ];

  const canNext = step === 0 ? (profile.name?.trim().length ?? 0) > 0 : true;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-8 sm:py-10" style={{ background: "linear-gradient(160deg, #0a1628 0%, #112240 50%, #0a1628 100%)" }}>
      <div className="mb-6 sm:mb-8 text-center animate-fade-up">
        <SunOrb altitude={45} isActive={false} />
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl mt-4" style={{ color: "var(--sun)" }}>Remind·D</h1>
        <p className="text-sm sm:text-base" style={{ color: "var(--text-muted)" }}>Vitamin D Sun Tracker</p>
      </div>

      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl animate-fade-up-2">
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <div key={i} className="rounded-full transition-all" style={{
              width: i === step ? 24 : 8,
              height: 8,
              background: i <= step ? "var(--sun)" : "rgba(255,255,255,0.1)",
            }} />
          ))}
        </div>

        <div className="glass rounded-2xl p-5 sm:p-6 md:p-8 lg:p-10">
          <h2 className="font-display text-xl sm:text-2xl md:text-2xl lg:text-3xl mb-1" style={{ color: "var(--text)" }}>{steps[step].title}</h2>
          <p className="text-sm sm:text-base mb-4 sm:mb-6" style={{ color: "var(--text-muted)" }}>{steps[step].subtitle}</p>
          {steps[step].content}
        </div>

        <div className="flex gap-3 mt-4 sm:mt-6">
          {step > 0 && (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="flex-1 py-3 rounded-xl transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              Back
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (step < steps.length - 1) setStep((s) => s + 1);
              else onComplete(profile as UserProfile);
            }}
            disabled={!canNext}
            className="flex-1 py-3 rounded-xl font-medium transition-all"
            aria-disabled={!canNext}
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
