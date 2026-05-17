import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Sparkles, TrendingUp } from "lucide-react";
import { HoloCard } from "@/components/HoloCard";
import { Header } from "./upload";

export const Route = createFileRoute("/timemachine")({
  component: TimeMachine,
  head: () => ({
    meta: [
      { title: "Time Machine · Promptal AI" },
      { name: "description", content: "See your resume six months from now." },
    ],
  }),
});

const CURRENT = {
  role: "Frontend Engineer · 3.5 yrs",
  skills: ["React", "TypeScript", "Node basics", "REST APIs"],
  wins: ["Shipped dashboard MVP", "Refactored auth flow", "Mentored 1 intern"],
  score: 68,
};

const FUTURE = {
  role: "Senior Full-Stack · System Design lead",
  skills: ["System Design", "Docker · K8s", "SQL Optimization", "Cloud (AWS)", "Leadership"],
  wins: ["Architected real-time service for 1M users", "Led 4-eng squad", "Cut p95 latency 60%", "Open-source library w/ 2k stars"],
  score: 89,
};

function TimeMachine() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-24 space-y-6">
      <Header step="07" title="Interview Time Machine" sub="Two timelines. One you. Pick the future." />

      <HoloCard glow className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative grid md:grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
          <ResumePanel
            tag="TIMELINE.A"
            label="Current You"
            data={CURRENT}
            tone="muted"
          />

          {/* Time vector */}
          <div className="relative flex md:flex-col items-center justify-center gap-4 px-4">
            <div className="relative h-24 w-24 grid place-items-center">
              <div className="absolute inset-0 rounded-full border border-cyan-glow/30 animate-spin-slow" />
              <div className="absolute inset-2 rounded-full border border-electric/30 animate-spin-slow [animation-direction:reverse]" />
              <Clock className="h-8 w-8 text-cyan-glow" />
            </div>
            <div className="text-center">
              <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-glow">DELTA · T</div>
              <div className="font-display text-2xl gradient-text">+6 months</div>
            </div>
            <ArrowRight className="h-6 w-6 text-cyan-glow hidden md:block" />
          </div>

          <ResumePanel
            tag="TIMELINE.B"
            label="Future You"
            data={FUTURE}
            tone="bright"
          />
        </div>
      </HoloCard>

      {/* Growth chart */}
      <HoloCard>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-glow">// projected growth</div>
            <h3 className="mt-1 font-display text-2xl">Readiness over time</h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-success">
            <TrendingUp className="h-3 w-3" /> +21% in 14 days
          </div>
        </div>
        <GrowthChart />
      </HoloCard>

      <div className="grid md:grid-cols-3 gap-5">
        {[
          { t: "Predicted Role", v: "Senior Full-Stack" },
          { t: "Career Growth", v: "+1 level" },
          { t: "Hiring Probability", v: "89%" },
        ].map((c) => (
          <HoloCard key={c.t}>
            <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-glow flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> {c.t}
            </div>
            <div className="mt-2 font-display text-3xl gradient-text">{c.v}</div>
          </HoloCard>
        ))}
      </div>

      <div className="flex justify-end">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-electric to-neon px-6 py-3 font-medium text-background shadow-[var(--glow-electric)]"
        >
          Run It Again <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function ResumePanel({
  tag,
  label,
  data,
  tone,
}: {
  tag: string;
  label: string;
  data: typeof CURRENT;
  tone: "muted" | "bright";
}) {
  const bright = tone === "bright";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative rounded-2xl p-6 ${
        bright
          ? "glass-strong neon-border-glow"
          : "glass border border-white/10"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-glow">{tag}</div>
        <div className={`font-display text-3xl ${bright ? "gradient-text" : "text-muted-foreground"}`}>
          {data.score}%
        </div>
      </div>
      <h3 className="mt-3 font-display text-2xl">{label}</h3>
      <div className={`mt-1 text-sm ${bright ? "text-foreground" : "text-muted-foreground"}`}>{data.role}</div>

      <div className="mt-5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">SKILLS</div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {data.skills.map((s) => (
          <span
            key={s}
            className={`rounded-full px-3 py-1 text-xs font-mono ${
              bright
                ? "bg-gradient-to-r from-electric/30 to-neon/30 border border-cyan-glow/40 text-foreground"
                : "glass text-muted-foreground"
            }`}
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mt-5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">WINS</div>
      <ul className="mt-2 space-y-1.5">
        {data.wins.map((w) => (
          <li key={w} className="flex items-start gap-2 text-sm">
            <span className={`mt-1 h-1.5 w-1.5 rounded-full ${bright ? "bg-cyan-glow shadow-[0_0_8px_var(--cyan-glow)]" : "bg-muted-foreground"}`} />
            <span className={bright ? "text-foreground" : "text-muted-foreground"}>{w}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function GrowthChart() {
  const pts = [68, 70, 73, 75, 78, 80, 82, 84, 86, 87, 88, 88.5, 89];
  const W = 800, H = 200, P = 20;
  const x = (i: number) => P + (i * (W - P * 2)) / (pts.length - 1);
  const y = (v: number) => H - P - ((v - 60) / 40) * (H - P * 2);
  const path = pts.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(v)}`).join(" ");
  const area = `${path} L ${x(pts.length - 1)} ${H - P} L ${x(0)} ${H - P} Z`;
  return (
    <div className="mt-4 -mx-2 overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[220px] min-w-[600px]">
        <defs>
          <linearGradient id="ga" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.72 0.22 260)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="oklch(0.72 0.22 260)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={P} x2={W - P} y1={P + i * ((H - P * 2) / 3)} y2={P + i * ((H - P * 2) / 3)} stroke="oklch(1 0 0 / 0.05)" />
        ))}
        <path d={area} fill="url(#ga)" />
        <path d={path} fill="none" stroke="oklch(0.85 0.18 200)" strokeWidth={2} style={{ filter: "drop-shadow(0 0 6px var(--electric))" }} />
        {pts.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r={i === pts.length - 1 ? 5 : 2.5} fill={i === pts.length - 1 ? "var(--neon)" : "var(--cyan-glow)"} />
        ))}
        <text x={x(0)} y={H - 4} className="fill-muted-foreground font-mono" fontSize="10">today</text>
        <text x={x(pts.length - 1) - 30} y={H - 4} className="fill-muted-foreground font-mono" fontSize="10">+14 days</text>
        <text x={x(pts.length - 1) - 30} y={y(pts[pts.length - 1]) - 10} className="fill-foreground font-mono" fontSize="12">89%</text>
      </svg>
    </div>
  );
}
