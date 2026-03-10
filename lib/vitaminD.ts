import SunCalc from "suncalc";
import type { UserProfile, SolarData } from "@/types";

// Fitzpatrick skin type data: [minimal erythemal dose in J/m², color desc, description]
export const SKIN_TYPES = [
  { type: 1, label: "Type I", desc: "Very fair, always burns, never tans", color: "#FDEBD0", med: 200 },
  { type: 2, label: "Type II", desc: "Fair, usually burns, sometimes tans", color: "#F5CBA7", med: 250 },
  { type: 3, label: "Type III", desc: "Medium, sometimes burns, always tans", color: "#E59866", med: 350 },
  { type: 4, label: "Type IV", desc: "Olive, rarely burns, always tans", color: "#CA6F1E", med: 450 },
  { type: 5, label: "Type V", desc: "Brown, very rarely burns", color: "#935116", med: 600 },
  { type: 6, label: "Type VI", desc: "Dark brown/black, never burns", color: "#4A235A", med: 800 },
];

export const BODY_EXPOSURE_OPTIONS = [
  { value: 5, label: "Face only", icon: "🧕" },
  { value: 15, label: "Face + arms", icon: "👕" },
  { value: 30, label: "T-shirt + shorts", icon: "🩳" },
  { value: 50, label: "Swimsuit", icon: "🩱" },
  { value: 75, label: "Minimal clothing", icon: "☀️" },
];

export function estimateUVFromAltitude(altitudeDeg: number): number {
  if (altitudeDeg <= 0) return 0;
  const uv = 0.04 * Math.pow(altitudeDeg, 1.05);
  return Math.min(Math.round(uv * 10) / 10, 16);
}

export function calcVitaminDPerMinute(
  uvIndex: number,
  skinType: number,
  bodyExposurePct: number,
  sunAltitudeDeg: number
): number {
  if (uvIndex < 0.5 || sunAltitudeDeg < 10) return 0;

  const bsaExposed = 1.7 * (bodyExposurePct / 100);
  const uvBIrradiance = uvIndex * 25;
  const skinFactors = [1.0, 0.85, 0.7, 0.55, 0.4, 0.3];
  const skinFactor = skinFactors[skinType - 1] ?? 0.7;
  const baseRate = 0.3;
  const cosineCorrection = Math.sin((sunAltitudeDeg * Math.PI) / 180);

  const iuPerMin = baseRate * uvBIrradiance * bsaExposed * 10000 * skinFactor * cosineCorrection / 1000;

  return Math.round(iuPerMin);
}

export function calcSafeMinutes(uvIndex: number, skinType: number): number {
  if (uvIndex <= 0) return 999;
  const skinTypeData = SKIN_TYPES[skinType - 1];
  if (!skinTypeData) return 30;

  const uvDoseRatePerMin = uvIndex * 25 * 60 / 1000;
  const safeMins = Math.round((skinTypeData.med / uvDoseRatePerMin) * 0.8);
  return Math.max(1, Math.min(safeMins, 180));
}

export function getSolarData(
  lat: number,
  lng: number,
  profile: UserProfile,
  date: Date = new Date()
): SolarData {
  const times = SunCalc.getTimes(date, lat, lng);
  const sunPos = SunCalc.getPosition(date, lat, lng);
  const altitudeDeg = (sunPos.altitude * 180) / Math.PI;

  const uvIndex = estimateUVFromAltitude(altitudeDeg);

  const vitaminDPerMinute = calcVitaminDPerMinute(
    uvIndex,
    profile.skinType,
    profile.bodyExposure,
    altitudeDeg
  );

  const safeMinutes = calcSafeMinutes(uvIndex, profile.skinType);

  const isOptimal = altitudeDeg > 30 && uvIndex >= 2;

  return {
    uvIndex,
    solarNoon: times.solarNoon,
    sunrise: times.sunrise,
    sunset: times.sunset,
    sunAltitude: Math.round(altitudeDeg * 10) / 10,
    isOptimal,
    safeMinutes,
    vitaminDPerMinute,
  };
}

export function getUVCategory(uv: number): { label: string; color: string; bg: string } {
  if (uv < 1) return { label: "None", color: "#9ca3af", bg: "#1f2937" };
  if (uv < 3) return { label: "Low", color: "#4ade80", bg: "#052e16" };
  if (uv < 6) return { label: "Moderate", color: "#facc15", bg: "#2d1b00" };
  if (uv < 8) return { label: "High", color: "#fb923c", bg: "#2c0a00" };
  if (uv < 11) return { label: "Very High", color: "#f87171", bg: "#2c0000" };
  return { label: "Extreme", color: "#e879f9", bg: "#1a0028" };
}

export function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function getRecommendedDaily(): number {
  return 1000;
}

export function getDailyProgress(todayIU: number): number {
  return Math.min(100, (todayIU / getRecommendedDaily()) * 100);
}
