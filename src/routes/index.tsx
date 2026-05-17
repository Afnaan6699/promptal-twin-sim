import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles, Brain, Radio, Activity } from "lucide-react";
import { HoloCard } from "@/components/HoloCard";
import { Typewriter } from "@/components/Typewriter";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Promptal AI — Meet Your AI Interview Twin" },
      {
        name: "description",
        content:
          "Train with a cinematic AI version of your future interviewer. Stress mode, lie detector, time machine — built for the year 2035.",
      },
    ],
  }),
});

const SCAN_LINES = [
  "BOOTING NEURAL CORE v2.35.7",
  "ANALYZING CANDIDATE DNA…",
  "PARSING SKILLS LATTICE…",
  "MAPPING JOB INTENT VECTOR…",
  "CREATING INTERVIEW UNIVERSE…",
  "INTERVIEW TWIN READY.",
];

function Landing() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (idx >= SCAN_LINES.length - 1) return;
    const t = setTimeout(() => setIdx((i) => i + 1), 1100);
    return () => clearTimeout(t);
  }, [idx]);

  return (
    <div className="relative">
      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="mx-auto w-full max-w-[1400px] px-6 grid lg:grid-cols-[1.15fr_1fr] gap-10 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-glow"
            >
              <Sparkles className="h-3 w-3" /> v2035 · neural simulation
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mt-6 font-display text-[clamp(2.5rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-tight"
            >
              Meet your <br />
              <span className="gradient-text text-glow">AI Interview Twin</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed"
            >
              Train with an AI version of your future interviewer{" "}
              <span className="text-foreground">before</span> the real interview happens.
              A cinematic simulator built for stress, depth, and truth.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-9 flex flex-wrap gap-3"
            >
              <Link
                to="/upload"
                className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-electric to-neon px-6 py-3.5 font-medium text-background shadow-[var(--glow-electric)] hover:shadow-[var(--glow-neon)] transition-shadow"
              >
                Start Simulation
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                <span className="absolute inset-0 rounded-xl border border-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <button 
                onClick={() => {
                  sessionStorage.setItem('demoMode', 'true');
                  window.location.reload();
                }}
                className="inline-flex items-center gap-2 rounded-xl glass px-6 py-3.5 font-medium text-foreground hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Play className="h-4 w-4 text-cyan-glow" /> Watch Demo
              </button>
            </motion.div>

            <div className="mt-10 grid grid-cols-3 gap-3 max-w-md">
              {[
                { v: "7", l: "Interviewer Twins" },
                { v: "120+", l: "Adaptive Questions" },
                { v: "<1s", l: "Neural Latency" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl glass px-3 py-3 text-center">
                  <div className="font-display text-xl gradient-text">{s.v}</div>
                  <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: scanning visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square rounded-3xl glass-strong hud-border overflow-hidden">
              {/* concentric rings */}
              <div className="absolute inset-0 grid place-items-center">
                {[0.35, 0.55, 0.75, 0.95].map((s, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full border border-electric/30 animate-spin-slow"
                    style={{
                      width: `${s * 100}%`,
                      height: `${s * 100}%`,
                      animationDuration: `${18 + i * 6}s`,
                      animationDirection: i % 2 ? "reverse" : "normal",
                    }}
                  >
                    <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-glow shadow-[0_0_12px_var(--cyan-glow)]" />
                  </div>
                ))}
                {/* core */}
                <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-electric to-neon shadow-[var(--glow-neon)] grid place-items-center">
                  <Brain className="h-12 w-12 text-background" />
                  <div className="absolute inset-0 rounded-full border border-white/40 animate-pulse-glow" />
                </div>
              </div>

              {/* scan beam */}
              <div className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-cyan-glow/30 to-transparent animate-scan" />

              {/* terminal log */}
              <div className="absolute bottom-4 left-4 right-4 rounded-xl glass p-3 font-mono text-[11px]">
                {SCAN_LINES.slice(0, idx + 1).map((l, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 ${
                      i === idx ? "text-cyan-glow" : "text-muted-foreground"
                    }`}
                  >
                    <span className="text-electric">›</span>
                    {i === idx ? <Typewriter text={l} speed={22} /> : <span>{l}</span>}
                  </div>
                ))}
              </div>

              {/* corner HUD labels */}
              <div className="absolute top-3 left-3 text-[9px] font-mono uppercase tracking-widest text-cyan-glow/80">
                CANDIDATE.DNA
              </div>
              <div className="absolute top-3 right-3 text-[9px] font-mono uppercase tracking-widest text-cyan-glow/80">
                LIVE · NEURAL
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="relative mx-auto max-w-[1400px] px-6 py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-glow">
              // capabilities
            </div>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">
              Not preparation. <span className="gradient-text">Simulation.</span>
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <Activity className="h-3 w-3 text-success" />
            7 modules online
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <HoloCard className="h-full">
                <div className="flex items-center justify-between">
                  <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${f.grad}`}>
                    <f.icon className="h-5 w-5 text-background" />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">{f.code}</span>
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                <div className="mt-5 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-cyan-glow">
                  <Radio className="h-3 w-3" /> module {f.code}
                </div>
              </HoloCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-[1400px] px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl glass-strong neon-border-glow p-10 md:p-14 text-center">
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="relative">
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-glow">
              ready when you are
            </div>
            <h2 className="mt-3 font-display text-4xl md:text-6xl font-bold">
              Step into the <span className="gradient-text">Interview Universe</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Upload your resume and a job description. Your AI Twin compiles in 12 seconds.
            </p>
            <Link
              to="/upload"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-electric to-neon px-7 py-4 font-medium text-background shadow-[var(--glow-electric)]"
            >
              Begin Boot Sequence <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const FEATURES = [
  {
    code: "02",
    title: "Holographic Upload",
    desc: "Drop resume + JD into a neural ingester. Watch your candidate DNA materialize.",
    icon: Sparkles,
    grad: "from-electric to-cyan-glow",
  },
  {
    code: "03",
    title: "Readiness Heatmap",
    desc: "Radar charts, hiring probability, skill matrix. Your strengths and shadows, glowing.",
    icon: Activity,
    grad: "from-cyan-glow to-electric",
  },
  {
    code: "04",
    title: "Interviewer Twins",
    desc: "FAANG, Founder, Stress, Behavioral, Rapid-fire. Pick a personality. Watch it boot.",
    icon: Brain,
    grad: "from-neon to-pink-glow",
  },
  {
    code: "05",
    title: "Live Voice Interview",
    desc: "Personalized questions, live transcription, waveform, confidence meter.",
    icon: Radio,
    grad: "from-electric to-neon",
  },
  {
    code: "06",
    title: "Lie Detector + Replay",
    desc: "Authenticity score, interviewer thoughts, emotion markers, timeline replay.",
    icon: Play,
    grad: "from-pink-glow to-neon",
  },
  {
    code: "07",
    title: "Interview Time Machine",
    desc: "See your resume six months from now. Future skills. Future role. Future you.",
    icon: ArrowRight,
    grad: "from-neon to-electric",
  },
];
