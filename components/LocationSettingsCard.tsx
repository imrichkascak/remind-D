"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { LocationPreferences, ManualLocationPick } from "@/types";
import { geocodeFromTimezone, searchPlaces, type GeocodeHit } from "@/lib/geocoding";

function formatHit(h: GeocodeHit): string {
  const parts = [h.name, h.admin1, h.country].filter(Boolean);
  return parts.join(", ");
}

export function LocationSettingsCard({
  locationPreferences,
  onLocationPreferencesChange,
}: {
  locationPreferences: LocationPreferences;
  onLocationPreferencesChange: (p: LocationPreferences) => void;
}) {
  const [cityQuery, setCityQuery] = useState("");
  const [hits, setHits] = useState<GeocodeHit[]>([]);
  const [tzFilter, setTzFilter] = useState("");
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);

  const timezones = useMemo(() => {
    try {
      return Intl.supportedValuesOf("timeZone").sort();
    } catch {
      return ["UTC", "Europe/Bratislava", "Europe/Prague", "America/New_York", "Asia/Tokyo"];
    }
  }, []);

  const filteredTz = useMemo(() => {
    const f = tzFilter.trim().toLowerCase();
    if (!f) return timezones.slice(0, 80);
    return timezones.filter((z) => z.toLowerCase().includes(f)).slice(0, 80);
  }, [timezones, tzFilter]);

  useEffect(() => {
    if (locationPreferences.mode !== "manual") return;
    const q = cityQuery.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    const t = setTimeout(() => {
      void (async () => {
        setGeoBusy(true);
        setGeoMsg(null);
        try {
          setHits(await searchPlaces(q));
        } catch {
          setHits([]);
          setGeoMsg("Search failed. Check connection.");
        } finally {
          setGeoBusy(false);
        }
      })();
    }, 350);
    return () => clearTimeout(t);
  }, [cityQuery, locationPreferences.mode]);

  const applyManualHit = useCallback(
    (h: GeocodeHit, timezone?: string) => {
      const manual: ManualLocationPick = {
        lat: h.lat,
        lng: h.lng,
        city: formatHit(h),
        timezone,
      };
      setGeoMsg(null);
      setHits([]);
      setCityQuery("");
      onLocationPreferencesChange({ mode: "manual", manual });
    },
    [onLocationPreferencesChange]
  );

  const handleTimezonePick = useCallback(
    async (iana: string) => {
      if (!iana) return;
      setGeoBusy(true);
      setGeoMsg(null);
      try {
        const hit = await geocodeFromTimezone(iana);
        if (!hit) {
          setGeoMsg('This zone cannot be mapped automatically — use city search.');
          setGeoBusy(false);
          return;
        }
        applyManualHit(hit, iana);
      } catch {
        setGeoMsg("Could not resolve that time zone. Try city search.");
      } finally {
        setGeoBusy(false);
      }
    },
    [applyManualHit]
  );

  const deviceTz =
    typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";

  const setModeAuto = () => {
    setGeoMsg(null);
    setHits([]);
    setCityQuery("");
    onLocationPreferencesChange({ mode: "auto", manual: null });
  };

  const setModeManual = () => {
    setGeoMsg(null);
    onLocationPreferencesChange({
      mode: "manual",
      manual: locationPreferences.mode === "manual" ? locationPreferences.manual : null,
    });
  };

  const manual = locationPreferences.manual;

  return (
    <div className="glass rounded-2xl p-5 lg:p-6 md:col-span-2">
      <h3
        className="text-sm font-medium mb-1"
        style={{ color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}
      >
        Location
      </h3>
      <p className="text-xs mb-4" style={{ color: "var(--text-muted)", lineHeight: 1.55 }}>
        On iPhone Safari, GPS often fails even with permissions. The app can use your{" "}
        <strong style={{ color: "var(--text)" }}>network / IP</strong> (automatic) or a place you set here.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={setModeAuto}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{
            background: locationPreferences.mode === "auto" ? "rgba(245,166,35,0.15)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${locationPreferences.mode === "auto" ? "rgba(245,166,35,0.35)" : "var(--border)"}`,
            color: locationPreferences.mode === "auto" ? "var(--sun)" : "var(--text-muted)",
            cursor: "pointer",
          }}
        >
          Automatic (IP + GPS)
        </button>
        <button
          type="button"
          onClick={setModeManual}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{
            background: locationPreferences.mode === "manual" ? "rgba(245,166,35,0.15)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${locationPreferences.mode === "manual" ? "rgba(245,166,35,0.35)" : "var(--border)"}`,
            color: locationPreferences.mode === "manual" ? "var(--sun)" : "var(--text-muted)",
            cursor: "pointer",
          }}
        >
          Manual (city / time zone)
        </button>
      </div>

      {locationPreferences.mode === "manual" && (
        <div className="space-y-4 pt-1 border-t" style={{ borderColor: "var(--border)" }}>
          {manual && (
            <p className="text-sm" style={{ color: "var(--text)" }}>
              <span style={{ color: "var(--text-muted)" }}>Selected: </span>
              {manual.city}
              {manual.timezone ? (
                <span className="text-xs block mt-1" style={{ color: "var(--text-muted)" }}>
                  {manual.timezone}
                </span>
              ) : null}
            </p>
          )}

          {deviceTz && (
            <div>
              <button
                type="button"
                disabled={geoBusy}
                onClick={() => void handleTimezonePick(deviceTz)}
                className="px-3 py-2 rounded-lg text-sm w-full sm:w-auto"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  cursor: geoBusy ? "wait" : "pointer",
                }}
              >
                Use this device’s time zone ({deviceTz})
              </button>
            </div>
          )}

          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
              Or pick IANA time zone (maps to a city via search)
            </label>
            <input
              type="search"
              value={tzFilter}
              onChange={(e) => setTzFilter(e.target.value)}
              placeholder="Filter, e.g. Bratislava, New_York…"
              className="w-full px-3 py-2 rounded-lg text-sm mb-2"
              style={{
                background: "rgba(0,0,0,0.2)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
            />
            <select
              value=""
              disabled={geoBusy}
              onChange={(e) => {
                const v = e.target.value;
                e.target.value = "";
                if (v) void handleTimezonePick(v);
              }}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{
                background: "rgba(0,0,0,0.2)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
              aria-label="Choose time zone"
            >
              <option value="">Select time zone…</option>
              {filteredTz.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
              Or search city / town
            </label>
            <input
              type="search"
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              placeholder="e.g. Košice, Vienna…"
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{
                background: "rgba(0,0,0,0.2)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
            />
            {geoBusy && cityQuery.trim().length >= 2 && (
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Searching…</p>
            )}
            {hits.length > 0 && (
              <ul className="mt-2 max-h-48 overflow-y-auto rounded-lg border" style={{ borderColor: "var(--border)" }}>
                {hits.map((h) => (
                  <li key={`${h.lat}-${h.lng}-${h.name}`} style={{ borderBottom: "1px solid var(--border)" }}>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-white/5"
                      style={{ color: "var(--text)", cursor: "pointer", background: "transparent", border: "none" }}
                      onClick={() => applyManualHit(h)}
                    >
                      {formatHit(h)}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {geoMsg && <p className="text-xs" style={{ color: "#f87171" }}>{geoMsg}</p>}
        </div>
      )}
    </div>
  );
}
