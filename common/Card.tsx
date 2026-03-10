import type { ReactNode } from "react";

type CardVariant = "default" | "warm";

export function Card({
  children,
  className = "",
  variant = "default",
}: {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
}) {
  const baseClass = variant === "warm" ? "glass-warm" : "glass";
  return (
    <div className={`${baseClass} ${className}`.trim()}>
      {children}
    </div>
  );
}
