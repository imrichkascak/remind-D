import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=uv_index&forecast_days=1&timezone=auto`;
    const res = await fetch(url, { next: { revalidate: 900 } });
    const data = await res.json();

    const now = new Date();
    const currentHour = now.getHours();
    const uvValues: number[] = data.hourly?.uv_index ?? [];

    const currentUV = uvValues[currentHour] ?? 0;
    const hourlyForecast = uvValues.slice(
      Math.max(0, currentHour - 1),
      currentHour + 13
    );

    let city = "Your Location";
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        {
          headers: { "User-Agent": "remindd-web/1.0" },
          next: { revalidate: 3600 },
        }
      );
      const geoData = await geoRes.json();
      city =
        geoData.address?.city ||
        geoData.address?.town ||
        geoData.address?.village ||
        geoData.address?.county ||
        city;
    } catch {
      // city stays as default
    }

    return NextResponse.json({
      currentUV: Math.round(currentUV * 10) / 10,
      hourlyForecast,
      city,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch UV data" }, { status: 500 });
  }
}
