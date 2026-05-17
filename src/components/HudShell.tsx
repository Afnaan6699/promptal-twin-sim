import { Link, useRouterState } from "@tanstack/react-router";
import { Mic, Cpu } from "lucide-react";

const NAV = [
  { to: "/", label: "Home", code: "01" },
  { to: "/upload", label: "Upload", code: "02" },
  { to: "/dashboard", label: "Heatmap", code: "03" },
  { to: "/twin", label: "Twin", code: "04" },
  { to: "/interview", label: "Live", code: "05" },
  { to: "/report", label: "Replay", code: "06" },
  { to: "/timemachine", label: "Time Machine", code: "07" },
] as const;

export function HudShell({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="relative min-h-screen">
      {/* Top HUD bar */}
      <header className="fixed top-0 left-0 right-0 z-40">
        <div className="mx-auto mt-4 flex max-w-[1400px] items-center justify-between gap-4 rounded-2xl glass-strong px-4 py-3 hud-border">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-electric to-neon shadow-[var(--glow-electric)]">
              <Cpu className="h-5 w-5 text-background" />
              <div className="absolute inset-0 rounded-xl border border-cyan-glow/40 animate-pulse-glow" />
            </div>
            <div className="leading-none">
              <div className="font-display text-sm tracking-[0.3em] text-muted-foreground">PROMPTAL</div>
              <div className="font-display text-base font-semibold gradient-text">INTERVIEW TWIN</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 rounded-xl glass px-1.5 py-1.5">
            {NAV.map((n) => {
              const active = path === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`relative rounded-lg px-3 py-1.5 text-xs font-medium tracking-wide transition-colors ${
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active && (
                    <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-electric/30 to-neon/30 shadow-[0_0_20px_oklch(0.72_0.22_260/0.45)]" />
                  )}
                  <span className="relative font-mono text-[10px] text-cyan-glow/80 mr-1.5">{n.code}</span>
                  <span className="relative">{n.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 rounded-xl glass px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              system online
            </div>
            <button
              className="group relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-electric to-neon shadow-[var(--glow-electric)] hover:scale-105 transition-transform"
              aria-label="Voice command"
            >
              <Mic className="h-4 w-4 text-background" />
              <span className="absolute inset-0 rounded-xl border border-white/30 animate-pulse-glow" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating AI orb */}
      <div className="fixed bottom-6 right-6 z-30">
        <div className="relative h-14 w-14 cursor-pointer">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-electric to-neon blur-xl opacity-70 animate-pulse-glow" />
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-electric to-neon shadow-[var(--glow-neon)]" />
          <div className="absolute inset-3 rounded-full glass-strong grid place-items-center">
            <div className="h-2 w-2 rounded-full bg-cyan-glow animate-pulse" />
          </div>
          <div className="absolute -inset-2 rounded-full border border-cyan-glow/30 animate-spin-slow" />
        </div>
      </div>

      <main className="pt-24">{children}</main>
    </div>
  );
}
