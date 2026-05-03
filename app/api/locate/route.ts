import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function clientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const vercelFwd = req.headers.get("x-vercel-forwarded-for");
  if (vercelFwd) {
    const first = vercelFwd.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real?.trim()) return real.trim();
  return null;
}

function isNonPublicIp(ip: string): boolean {
  if (ip === "::1" || ip === "127.0.0.1") return true;
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) return true;
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(ip)) return true;
  const m = /^172\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/.exec(ip);
  if (m) {
    const n = Number(m[1]);
    if (n >= 16 && n <= 31) return true;
  }
  if (/^fe80:/i.test(ip) || /^fc00:/i.test(ip) || /^fd[0-9a-f]{2}:/i.test(ip)) return true;
  return false;
}

export async function GET(req: NextRequest) {
  const latH = req.headers.get("x-vercel-ip-latitude");
  const lngH = req.headers.get("x-vercel-ip-longitude");
  if (latH && lngH) {
    const lat = Number.parseFloat(latH);
    const lng = Number.parseFloat(lngH);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const city = req.headers.get("x-vercel-ip-city")?.trim() || undefined;
      return NextResponse.json({ lat, lng, city, source: "edge" as const });
    }
  }

  const ip = clientIp(req);
  if (!ip || isNonPublicIp(ip)) {
    return NextResponse.json(
      { error: "no_public_ip", message: "No public client IP (e.g. local dev without proxy headers)." },
      { status: 404 }
    );
  }

  try {
    const geoRes = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (!geoRes.ok) {
      return NextResponse.json({ error: "lookup_failed" }, { status: 502 });
    }
    const geo = (await geoRes.json()) as {
      success?: boolean;
      latitude?: number;
      longitude?: number;
      city?: string;
      region?: string;
    };
    if (
      !geo.success ||
      typeof geo.latitude !== "number" ||
      typeof geo.longitude !== "number" ||
      !Number.isFinite(geo.latitude) ||
      !Number.isFinite(geo.longitude)
    ) {
      return NextResponse.json({ error: "lookup_failed" }, { status: 502 });
    }
    const city = geo.city?.trim() || geo.region?.trim() || undefined;
    return NextResponse.json({
      lat: geo.latitude,
      lng: geo.longitude,
      city,
      source: "ip" as const,
    });
  } catch {
    return NextResponse.json({ error: "lookup_failed" }, { status: 502 });
  }
}
