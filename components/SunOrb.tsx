export function SunOrb({ altitude, isActive }: { altitude: number; isActive: boolean }) {
  const size = isActive ? 140 : 100;
  const opacity = Math.max(0.2, Math.min(1, (altitude + 10) / 60));
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {isActive && (
        <>
          <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, transparent 40%, rgba(245,166,35,0.08) 70%, transparent 100%)", transform: "scale(2.5)", animation: "sun-pulse 3s ease-in-out infinite" }} />
          <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, transparent 40%, rgba(245,166,35,0.05) 70%, transparent 100%)", transform: "scale(3.5)", animation: "sun-pulse 3s ease-in-out 1s infinite" }} />
        </>
      )}
      <div
        className="sun-orb absolute"
        style={{
          width: size,
          height: size,
          opacity,
          animation: isActive ? "sun-pulse 3s ease-in-out infinite" : "none",
          background: `radial-gradient(circle, #FFE566 0%, #F5A623 45%, #E07B00 75%, transparent 100%)`,
        }}
      />
      <div className="absolute" style={{ width: size * 1.6, height: size * 1.6, opacity: opacity * 0.4, animation: isActive ? "rays-spin 20s linear infinite" : "none" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="absolute" style={{
            width: 2,
            height: size * 0.3,
            background: "linear-gradient(to bottom, #FFD166, transparent)",
            top: "50%",
            left: "50%",
            transformOrigin: `1px ${-size * 0.6}px`,
            transform: `translateX(-50%) rotate(${i * 45}deg)`,
          }} />
        ))}
      </div>
    </div>
  );
}
