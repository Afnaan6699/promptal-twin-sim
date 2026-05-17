import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Brain, BookOpen, Mic2, Eye, TrendingUp } from "lucide-react";
import { HoloCard } from "@/components/HoloCard";
import { Header } from "./upload";
import { CircleScore } from "@/components/CircleScore";

export const Route = createFileRoute("/report")({
  component: Report,
  head: () => ({ meta: [{ title: "Replay · Promptal AI" }] }),
});

const TIMELINE = [
  { q: "Why Node over Django?", note: "Good structure but lacked depth on event loop.", tag: "Decent", c: "neon" },
  { q: "Architect chat for 1M users.", note: "Strong technical answer. Mentioned pub/sub, sharding.", tag: "Strong", c: "success" },
  { q: "Explain Python decorators.", note: "Avoid overexplaining. Got to the point too late.", tag: "Wobbly", c: "pink-glow" },
  { q: "Risky ship story.", note: "Excellent STAR format. Showed ownership.", tag: "Strong", c: "success" },
  { q: "Re-answer in 30s.", note: "Cut to signal. Confidence dipped under pressure.", tag: "Pressure", c: "danger" },
] as const;

const MISSING = [
  { skill: "System Design", impact: 92, weeks: 2 },
  { skill: "Docker", impact: 68, weeks: 1 },
  { skill: "SQL Optimization", impact: 74, weeks: 1 },
  { skill: "Leadership", impact: 58, weeks: 3 },
  { skill: "Cloud deployment", impact: 81, weeks: 2 },
];

function Report() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-24 space-y-6">
      <Header step="06" title="Interview Replay & Coach" sub="What your Twin observed. What it prescribes." />

      {/* Emotional gauges */}
      <div className="grid md:grid-cols-4 gap-5">
        {[
          { icon: Mic2, label: "Speech Clarity", v: 78, c: "electric" as const },
          { icon: Brain, label: "Confidence", v: 64, c: "neon" as const },
          { icon: Eye, label: "Eye Contact", v: 71, c: "cyan-glow" as const },
          { icon: TrendingUp, label: "Energy", v: 82, c: "success" as const },
        ].map((m) => (
          <HoloCard key={m.label} className="flex items-center gap-4">
            <CircleScore value={m.v} label={m.label} color={m.c} size={110} />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-cyan-glow">
                <m.icon className="h-3 w-3" /> module
              </div>
              <div className="font-display text-lg">{m.label}</div>
              <div className="text-xs text-muted-foreground">
                {m.v > 75 ? "Strong baseline" : m.v > 60 ? "Room to grow" : "Train this"}
              </div>
            </div>
          </HoloCard>
        ))}
      </div>

      {/* Timeline */}
      <HoloCard glow>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-glow">// timeline replay</div>
            <h3 className="mt-1 font-display text-2xl">What your interviewer thought</h3>
          </div>
          <div className="text-xs font-mono text-muted-foreground">5 questions · 12m 04s</div>
        </div>
        <div className="mt-6 relative">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-electric via-neon to-pink-glow" />
          <div className="space-y-5">
            {TIMELINE.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative pl-10"
              >
                <span
                  className={`absolute left-0 top-1 h-6 w-6 rounded-full border-2 grid place-items-center ${
                    t.c === "success" ? "bg-success/30 border-success shadow-[0_0_12px_var(--success)]" :
                    t.c === "danger" ? "bg-danger/30 border-danger shadow-[0_0_12px_var(--danger)]" :
                    t.c === "pink-glow" ? "bg-pink-glow/30 border-pink-glow shadow-[0_0_12px_var(--pink-glow)]" :
                    "bg-neon/30 border-neon shadow-[0_0_12px_var(--neon)]"
                  }`}
                >
                  <span className="text-[10px] font-mono">{i + 1}</span>
                </span>
                <div className="flex items-baseline justify-between gap-3">
                  <div className="font-display text-base">{t.q}</div>
                  <span className={`text-[10px] font-mono uppercase tracking-widest ${
                    t.c === "success" ? "text-success" :
                    t.c === "danger" ? "text-danger" :
                    t.c === "pink-glow" ? "text-pink-glow" : "text-neon"
                  }`}>{t.tag}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-0.5 italic">"{t.note}"</div>
              </motion.div>
            ))}
          </div>
        </div>
      </HoloCard>

      {/* Skill gap roadmap */}
      <HoloCard>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-glow">// hidden skill gaps</div>
            <h3 className="mt-1 font-display text-2xl">Your 2-Week Roadmap</h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-glow">
            <BookOpen className="h-3 w-3" /> auto-generated
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {MISSING.map((m, i) => (
            <motion.div
              key={m.skill}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-[1fr_2fr_auto] items-center gap-4 rounded-xl glass p-4"
            >
              <div>
                <div className="font-display">{m.skill}</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  {m.weeks}wk · impact +{m.impact}%
                </div>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${m.impact}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2 }}
                  className="h-full bg-gradient-to-r from-electric to-neon shadow-[0_0_12px_var(--electric)]"
                />
              </div>
              <button className="rounded-lg glass border border-cyan-glow/30 px-3 py-1.5 text-xs font-mono hover:bg-cyan-glow/10">
                Start
              </button>
            </motion.div>
          ))}
        </div>
      </HoloCard>

      <div className="flex justify-end">
        <Link
          to="/timemachine"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-electric to-neon px-6 py-3 font-medium text-background shadow-[var(--glow-electric)]"
        >
          Open Time Machine <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
