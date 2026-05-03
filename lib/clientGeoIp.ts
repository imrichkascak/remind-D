/** Browser-side approximate location from public IP (works on localhost & when /api/locate fails). */

export async function fetchApproxCoordsFromClientNetworks(): Promise<{
  lat: number;
  lng: number;
  city?: string;
} | null> {
  const fromIpwho = async () => {
    const res = await fetch("https://ipwho.is/", { credentials: "omit" });
    if (!res.ok) return null;
    const geo = (await res.json()) as {
      success?: boolean;
      latitude?: number;
      longitude?: number;
      city?: string;
      country?: string;
    };
    if (
      !geo.success ||
      typeof geo.latitude !== "number" ||
      typeof geo.longitude !== "number" ||
      !Number.isFinite(geo.latitude) ||
      !Number.isFinite(geo.longitude)
    ) {
      return null;
    }
    const city = [geo.city, geo.country].filter(Boolean).join(", ") || undefined;
    return { lat: geo.latitude, lng: geo.longitude, city };
  };

  const fromGeoJs = async () => {
    const res = await fetch("https://get.geojs.io/v1/ip/geo.json", { credentials: "omit" });
    if (!res.ok) return null;
    const j = (await res.json()) as {
      latitude?: string;
      longitude?: string;
      city?: string;
      country?: string;
    };
    const lat = Number.parseFloat(j.latitude ?? "");
    const lng = Number.parseFloat(j.longitude ?? "");
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    const city = [j.city, j.country].filter(Boolean).join(", ") || undefined;
    return { lat, lng, city };
  };

  try {
    const a = await fromIpwho();
    if (a) return a;
  } catch {
    /* try next */
  }

  try {
    return await fromGeoJs();
  } catch {
    return null;
  }
}
