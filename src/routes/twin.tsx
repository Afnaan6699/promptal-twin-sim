import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Zap } from "lucide-react";
import { HoloCard } from "@/components/HoloCard";
import { Header } from "./upload";

export const Route = createFileRoute("/twin")({
  component: TwinPage,
  head: () => ({ meta: [{ title: "Twins · Promptal AI" }] }),
});

const TWINS = [
  { name: "Helena", role: "Friendly HR", emoji: "🤝", diff: "Easy", tone: "Warm", power: "Builds rapport", grad: "from-cyan-glow to-electric" },
  { name: "Vance", role: "FAANG Interviewer", emoji: "🧠", diff: "Hard", tone: "Surgical", power: "Deep system design", grad: "from-electric to-neon" },
  { name: "Sora", role: "Startup Founder", emoji: "🚀", diff: "Medium", tone: "Curious", power: "Ownership probes", grad: "from-neon to-pink-glow" },
  { name: "Krieg", role: "Stress Interviewer", emoji: "⚡", diff: "Insane", tone: "Relentless", power: "Pressure spikes", grad: "from-danger to-pink-glow" },
  { name: "Nyx", role: "Rapid-Fire", emoji: "💥", diff: "Hard", tone: "Quickfire", power: "1-min answers", grad: "from-pink-glow to-neon" },
  { name: "Mara", role: "Behavioral Expert", emoji: "🎭", diff: "Medium", tone: "Empathic", power: "STAR analysis", grad: "from-neon to-electric" },
  { name: "Axiom", role: "DSA Expert", emoji: "🧮", diff: "Hard", tone: "Precise", power: "Algorithmic depth", grad: "from-electric to-cyan-glow" },
];

function TwinPage() {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-24">
      <Header step="04" title="Choose Your Interview Twin" sub="Each twin is a personality, a difficulty curve, and a weapon." />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {TWINS.map((t, i) => {
          const active = sel === i;
          return (
            <motion.button
              key={t.name}
              onClick={() => setSel(i)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`text-left rounded-2xl glass-strong p-5 transition-all hover:-translate-y-1 relative overflow-hidden group ${
                active ? "neon-border-glow ring-1 ring-cyan-glow/60" : ""
              }`}
            >
              <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-to-br opacity-30 blur-2xl group-hover:opacity-50 transition-opacity"
                style={{ backgroundImage: `linear-gradient(135deg, var(--electric), var(--neon))` }}
              />
              <div className={`relative h-20 w-20 rounded-2xl bg-gradient-to-br ${t.grad} grid place-items-center text-4xl shadow-[var(--glow-electric)]`}>
                <span>{t.emoji}</span>
                <span className="absolute inset-0 rounded-2xl border border-white/30 animate-pulse-glow" />
              </div>
              <div className="mt-4 text-[10px] font-mono uppercase tracking-widest text-cyan-glow">
                TWIN.{String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-1 font-display text-xl">{t.name}</h3>
              <div className="text-sm text-muted-foreground">{t.role}</div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] font-mono uppercase tracking-wider">
                <Stat label="DIFF" value={t.diff} />
                <Stat label="TONE" value={t.tone} />
                <Stat label="POWER" value={t.power} />
              </div>

              {active && (
                <div className="mt-4 flex items-center gap-2 text-xs font-mono text-cyan-glow">
                  <Zap className="h-3 w-3" /> BOOTING…
                  <div className="ml-auto h-1 flex-1 max-w-[80px] rounded-full bg-white/10 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.5 }} className="h-full bg-gradient-to-r from-electric to-neon" />
                  </div>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <Link
          to="/interview"
          className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-electric to-neon px-6 py-3 font-medium text-background shadow-[var(--glow-electric)] ${
            sel === null ? "opacity-40 pointer-events-none" : ""
          }`}
        >
          Enter Interview Room <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md glass px-2 py-1.5">
      <div className="text-[8px] text-muted-foreground">{label}</div>
      <div className="text-foreground truncate text-[10px]">{value}</div>
    </div>
  );
}
