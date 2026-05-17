import { useEffect, useState } from "react";

export function CircleScore({
  value,
  label,
  color = "electric",
  size = 140,
}: {
  value: number;
  label: string;
  color?: "electric" | "neon" | "cyan-glow" | "pink-glow" | "success" | "danger";
  size?: number;
}) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setV(value), 80);
    return () => clearTimeout(t);
  }, [value]);
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const dash = c * (v / 100);
  const stroke = `var(--${color})`;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="oklch(1 0 0 / 0.08)"
          strokeWidth={6}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={stroke}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          fill="none"
          style={{
            transition: "stroke-dasharray 1.6s cubic-bezier(.2,.7,.2,1)",
            filter: `drop-shadow(0 0 8px ${stroke})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-3xl font-bold gradient-text">{Math.round(v)}%</div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}
