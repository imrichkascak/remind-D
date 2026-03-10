import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle, #FFE566 0%, #F5A623 40%, #E07B00 85%, transparent 100%)",
          borderRadius: "50%",
        }}
      />
    ),
    { ...size }
  );
}
