export interface GeocodeHit {
  name: string;
  lat: number;
  lng: number;
  admin1?: string;
  country?: string;
}

/** Map IANA time zone to a search string (e.g. Europe/Bratislava → Bratislava). */
export function timezoneToGeocodeQuery(iana: string): string | null {
  if (iana.startsWith("Etc/")) return null;
  const parts = iana.split("/");
  const last = parts[parts.length - 1];
  if (!last) return null;
  return last.replace(/_/g, " ");
}

export async function searchPlaces(query: string): Promise<GeocodeHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=10&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = (await res.json()) as {
    results?: { name: string; latitude: number; longitude: number; admin1?: string; country?: string }[];
  };
  return (data.results ?? []).map((r) => ({
    name: r.name,
    lat: r.latitude,
    lng: r.longitude,
    admin1: r.admin1,
    country: r.country,
  }));
}

export async function geocodeFromTimezone(iana: string): Promise<GeocodeHit | null> {
  const search = timezoneToGeocodeQuery(iana);
  if (!search) return null;
  const hits = await searchPlaces(search);
  return hits[0] ?? null;
}
