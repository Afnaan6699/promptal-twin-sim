import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Code2, MessageSquare, Sparkles, Target } from "lucide-react";
import { HoloCard } from "@/components/HoloCard";
import { CircleScore } from "@/components/CircleScore";
import { Header } from "./upload";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Heatmap · Promptal AI" }] }),
});

const SKILLS = [
  { name: "React", level: 92 },
  { name: "Node.js", level: 78 },
  { name: "TypeScript", level: 86 },
  { name: "System Design", level: 42 },
  { name: "Docker", level: 38 },
  { name: "SQL Optimization", level: 55 },
];

const SCORES = [
  { v: 82, l: "Technical", c: "electric" as const },
  { v: 65, l: "Communication", c: "neon" as const },
  { v: 58, l: "Confidence", c: "pink-glow" as const },
  { v: 74, l: "Role Match", c: "cyan-glow" as const },
];

// Radar polygon
const RADAR_AXES = ["Tech", "Comm", "Depth", "Speed", "Calm", "Fit"];
const RADAR_DATA = [82, 65, 70, 60, 58, 74];

function Dashboard() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-24">
      <Header step="03" title="Candidate Heatmap" sub="Your readiness, visualized. Everything pulses." />

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-5">
        {/* Score grid */}
        <HoloCard glow>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-glow">
                INTERVIEW.READINESS
              </div>
              <h3 className="mt-1 font-display text-2xl">Cognitive Diagnostics</h3>
            </div>
            <div className="text-right">
              <div className="font-display text-3xl gradient-text">68%</div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Hiring Probability
              </div>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 place-items-center">
            {SCORES.map((s) => (
              <CircleScore key={s.l} value={s.v} label={s.l} color={s.c} />
            ))}
          </div>
        </HoloCard>

        {/* Radar */}
        <HoloCard>
          <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-glow">
            // radar map
          </div>
          <h3 className="mt-1 font-display text-2xl">Skill Lattice</h3>
          <div className="mt-2 grid place-items-center">
            <Radar values={RADAR_DATA} axes={RADAR_AXES} />
          </div>
        </HoloCard>

        {/* Skill matrix */}
        <HoloCard className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-glow">
                // skill matrix
              </div>
              <h3 className="mt-1 font-display text-2xl">Resume vs Job Description</h3>
            </div>
            <div className="hidden md:flex gap-2 text-[10px] font-mono uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-electric"/> strong</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-neon"/> partial</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-danger"/> gap</span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {SKILLS.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-[140px_1fr_50px] items-center gap-4"
              >
                <div className="font-mono text-sm">{s.name}</div>
                <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${s.level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      s.level > 70
                        ? "bg-gradient-to-r from-electric to-cyan-glow shadow-[0_0_12px_var(--electric)]"
                        : s.level > 50
                        ? "bg-gradient-to-r from-neon to-pink-glow shadow-[0_0_12px_var(--neon)]"
                        : "bg-gradient-to-r from-danger to-pink-glow shadow-[0_0_12px_var(--danger)]"
                    }`}
                  />
                </div>
                <div className="text-right font-mono text-xs text-muted-foreground">{s.level}%</div>
              </motion.div>
            ))}
          </div>
        </HoloCard>

        {/* Strengths */}
        <Mini icon={Sparkles} title="Strengths" items={["React mastery", "Clean code", "Product thinking"]} c="electric" />
        <Mini icon={Code2} title="Tech Stack" items={["React", "Node", "TypeScript", "Postgres"]} c="cyan-glow" />
        <Mini icon={MessageSquare} title="Watch-outs" items={["System design depth", "Verbose answers", "DSA recall"]} c="pink-glow" />
        <Mini icon={Target} title="Missing for Role" items={["Docker", "System Design", "Leadership"]} c="danger" />
        <Mini icon={TrendingUp} title="Experience" items={["3.5 yrs", "Mid-Senior", "0 FAANG"]} c="neon" />
      </div>

      <div className="mt-8 flex justify-end">
        <Link
          to="/twin"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-electric to-neon px-6 py-3 font-medium text-background shadow-[var(--glow-electric)]"
        >
          Materialize Your Twin <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

const COLOR_TILE: Record<string, string> = {
  electric: "bg-electric/20 border-electric/40 text-electric",
  neon: "bg-neon/20 border-neon/40 text-neon",
  "cyan-glow": "bg-cyan-glow/20 border-cyan-glow/40 text-cyan-glow",
  "pink-glow": "bg-pink-glow/20 border-pink-glow/40 text-pink-glow",
  danger: "bg-danger/20 border-danger/40 text-danger",
};

function Mini({
  icon: Icon,
  title,
  items,
  c,
}: {
  icon: typeof Sparkles;
  title: string;
  items: string[];
  c: "electric" | "neon" | "cyan-glow" | "pink-glow" | "danger";
}) {
  return (
    <HoloCard>
      <div className="flex items-center gap-2">
        <div className={`grid h-8 w-8 place-items-center rounded-lg border ${COLOR_TILE[c]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="font-display text-lg">{title}</div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {items.map((i) => (
          <span
            key={i}
            className="rounded-full glass px-3 py-1 text-xs font-mono"
          >
            {i}
          </span>
        ))}
      </div>
    </HoloCard>
  );
}

function Radar({ values, axes }: { values: number[]; axes: string[] }) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 28;
  const N = values.length;
  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / N - Math.PI / 2;
    const r = (R * v) / 100;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as const;
  };
  const poly = values.map((v, i) => pt(i, v).join(",")).join(" ");
  return (
    <svg width={size} height={size}>
      <defs>
        <linearGradient id="rg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.72 0.22 260)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="oklch(0.68 0.25 310)" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon
          key={f}
          points={Array.from({ length: N }, (_, i) => pt(i, f * 100).join(",")).join(" ")}
          fill="none"
          stroke="oklch(1 0 0 / 0.08)"
        />
      ))}
      {Array.from({ length: N }, (_, i) => {
        const [x, y] = pt(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="oklch(1 0 0 / 0.06)" />;
      })}
      <polygon points={poly} fill="url(#rg)" stroke="oklch(0.85 0.18 200)" strokeWidth={1.5} style={{ filter: "drop-shadow(0 0 8px var(--electric))" }} />
      {values.map((_, i) => {
        const [x, y] = pt(i, 100);
        const a = (Math.PI * 2 * i) / N - Math.PI / 2;
        const lx = cx + Math.cos(a) * (R + 14);
        const ly = cy + Math.sin(a) * (R + 14);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={3} fill="var(--cyan-glow)" />
            <text x={lx} y={ly} textAnchor="middle" dy="0.35em" className="fill-muted-foreground font-mono" fontSize="10">
              {axes[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
