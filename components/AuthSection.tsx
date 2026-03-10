"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function AuthSection() {
  const { user, loading, signIn, signUp, signOut, isConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isConfigured) {
    return (
      <div className="glass rounded-2xl p-5 lg:p-6">
        <h3 className="text-sm font-medium mb-2" style={{ color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Sync across devices
        </h3>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Add <code className="text-xs px-1 py-0.5 rounded" style={{ background: "var(--surface)" }}>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="text-xs px-1 py-0.5 rounded" style={{ background: "var(--surface)" }}>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to enable sign-in and sync.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass rounded-2xl p-5 lg:p-6">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Checking sign-in…</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="glass rounded-2xl p-5 lg:p-6">
        <h3 className="text-sm font-medium mb-2" style={{ color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Account &amp; sync
        </h3>
        <p className="text-sm mb-4" style={{ color: "var(--text)" }}>
          Signed in as <span style={{ color: "var(--sun)" }}>{user.email}</span>. Data syncs across your devices (name and location stay only on this device).
        </p>
        <button
          type="button"
          onClick={() => signOut()}
          className="py-2 px-4 rounded-xl text-sm transition-all"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", color: "var(--text)", cursor: "pointer" }}
        >
          Sign out
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setBusy(true);
    const { error } = isSignUp ? await signUp(email, password) : await signIn(email, password);
    setBusy(false);
    if (error) {
      setMessage({ type: "error", text: error });
    } else if (isSignUp) {
      setMessage({ type: "success", text: "Check your email to confirm your account." });
    }
  };

  return (
    <div className="glass rounded-2xl p-5 lg:p-6">
      <h3 className="text-sm font-medium mb-2" style={{ color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
        Sign in to sync across devices
      </h3>
      <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
        Only non-sensitive data (e.g. skin type, sessions without location) is synced. Name and location stay on this device.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2.5 rounded-xl text-sm"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", color: "var(--text)", outline: "none" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2.5 rounded-xl text-sm"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", color: "var(--text)", outline: "none" }}
        />
        {message && (
          <p className="text-sm" style={{ color: message.type === "error" ? "#f87171" : "#4ade80" }}>
            {message.text}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={busy}
            className="py-2.5 px-4 rounded-xl text-sm font-medium transition-all"
            style={{
              background: "linear-gradient(135deg, var(--sun), var(--sun-deep))",
              color: "#000",
              border: "none",
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.7 : 1,
            }}
          >
            {isSignUp ? "Sign up" : "Sign in"}
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp((v) => !v); setMessage(null); }}
            className="py-2.5 px-4 rounded-xl text-sm transition-all"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer" }}
          >
            {isSignUp ? "Sign in instead" : "Sign up"}
          </button>
        </div>
      </form>
    </div>
  );
}
