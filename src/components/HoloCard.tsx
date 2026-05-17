import type { ReactNode } from "react";

export function HoloCard({
  children,
  className = "",
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`group relative rounded-2xl glass-strong p-6 transition-all duration-300 hover:-translate-y-0.5 ${
        glow ? "neon-border-glow" : ""
      } ${className}`}
    >
      {/* corner ticks */}
      <span className="pointer-events-none absolute -top-px -left-px h-4 w-4 border-t border-l border-cyan-glow/60 rounded-tl-2xl" />
      <span className="pointer-events-none absolute -top-px -right-px h-4 w-4 border-t border-r border-cyan-glow/60 rounded-tr-2xl" />
      <span className="pointer-events-none absolute -bottom-px -left-px h-4 w-4 border-b border-l border-cyan-glow/60 rounded-bl-2xl" />
      <span className="pointer-events-none absolute -bottom-px -right-px h-4 w-4 border-b border-r border-cyan-glow/60 rounded-br-2xl" />
      {/* scan line on hover */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-glow to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      {children}
    </div>
  );
}
