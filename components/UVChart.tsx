import { getUVCategory } from "@/lib/vitaminD";

export function UVChart({ hourlyUV, currentHour }: { hourlyUV: number[]; currentHour: number }) {
  const max = Math.max(...hourlyUV, 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {hourlyUV.slice(0, 12).map((uv, i) => {
        const cat = getUVCategory(uv);
        const height = Math.max(4, (uv / max) * 56);
        const isCurrent = i === 0;
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div
              className="w-full rounded-sm transition-all"
              style={{
                height,
                background: isCurrent ? cat.color : `${cat.color}55`,
                border: isCurrent ? `1px solid ${cat.color}` : "none",
              }}
              title={`UV ${uv}`}
            />
            <span className="text-xs" style={{ color: "var(--text-muted)", fontSize: 9 }}>
              {(currentHour + i) % 24}h
            </span>
          </div>
        );
      })}
    </div>
  );
}
