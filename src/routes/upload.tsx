import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Briefcase, Target, ArrowRight, CheckCircle2, Zap } from "lucide-react";
import { HoloCard } from "@/components/HoloCard";
import { Typewriter } from "@/components/Typewriter";

export const Route = createFileRoute("/upload")({
  component: UploadPage,
  head: () => ({
    meta: [
      { title: "Upload · Promptal AI" },
      { name: "description", content: "Drop your resume and job description into the neural ingester." },
    ],
  }),
});

const STAGES = [
  "Initializing ingestion lattice…",
  "Analyzing candidate DNA…",
  "Parsing skills…",
  "Mapping job intent…",
  "Creating interview universe…",
  "Twin compiled. Ready.",
];

function UploadPage() {
  const [resume, setResume] = useState(false);
  const [jd, setJd] = useState(false);
  const [role, setRole] = useState("");
  const [scanning, setScanning] = useState(false);
  const [stage, setStage] = useState(0);
  const ready = resume && jd && role.trim().length > 1;

  useEffect(() => {
    if (!scanning) return;
    if (stage >= STAGES.length - 1) return;
    const t = setTimeout(() => setStage((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [scanning, stage]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-24">
      <Header step="02" title="Holographic Ingestion" sub="Feed the neural core. Resume. JD. Role." />

      <AnimatePresence mode="wait">
        {!scanning ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid lg:grid-cols-3 gap-5"
          >
            <DropTile
              icon={FileText}
              label="Resume"
              hint=".pdf · .docx"
              done={resume}
              onClick={() => setResume(true)}
            />
            <DropTile
              icon={Briefcase}
              label="Job Description"
              hint="paste link or upload"
              done={jd}
              onClick={() => setJd(true)}
            />
            <HoloCard>
              <div className="flex items-center justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-pink-glow to-neon">
                  <Target className="h-5 w-5 text-background" />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">TARGET.ROLE</span>
              </div>
              <h3 className="mt-5 font-display text-xl">Target Role</h3>
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Senior Frontend Engineer"
                className="mt-3 w-full rounded-xl bg-background/40 border border-white/10 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-cyan-glow/50 focus:shadow-[0_0_0_3px_oklch(0.85_0.18_200/0.15)] font-mono text-sm"
              />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["FAANG SWE", "Product Designer", "AI Engineer"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setRole(p)}
                    className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-cyan-glow px-2 py-1 rounded-md border border-white/10 hover:border-cyan-glow/40 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </HoloCard>

            <div className="lg:col-span-3 flex items-center justify-between rounded-2xl glass-strong p-5 hud-border">
              <div className="text-sm text-muted-foreground font-mono">
                {ready ? (
                  <span className="text-success">● ALL SYSTEMS NOMINAL</span>
                ) : (
                  <span>● awaiting inputs…</span>
                )}
              </div>
              <button
                disabled={!ready}
                onClick={() => setScanning(true)}
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-electric to-neon px-6 py-3 font-medium text-background shadow-[var(--glow-electric)] disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
              >
                <Zap className="h-4 w-4" />
                Initiate Neural Scan
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="scan"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid lg:grid-cols-[1fr_1.1fr] gap-6"
          >
            {/* scanning viz */}
            <div className="relative aspect-square rounded-3xl glass-strong hud-border overflow-hidden">
              <div className="absolute inset-0 grid place-items-center">
                {[0.4, 0.6, 0.85].map((s, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full border border-cyan-glow/30 animate-spin-slow"
                    style={{
                      width: `${s * 100}%`,
                      height: `${s * 100}%`,
                      animationDuration: `${14 + i * 5}s`,
                      animationDirection: i % 2 ? "reverse" : "normal",
                    }}
                  />
                ))}
                <div className="h-28 w-28 rounded-full bg-gradient-to-br from-electric to-neon shadow-[var(--glow-neon)] animate-pulse-glow" />
              </div>
              <div className="absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-cyan-glow/40 to-transparent animate-scan" />
              <div className="absolute top-4 left-4 text-[10px] font-mono uppercase tracking-widest text-cyan-glow">
                CANDIDATE.DNA · SCANNING
              </div>
            </div>

            {/* log */}
            <div className="rounded-3xl glass-strong p-6 hud-border">
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-glow">
                // neural log
              </div>
              <div className="mt-4 space-y-3 font-mono text-sm">
                {STAGES.slice(0, stage + 1).map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {i < stage ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <span className="h-4 w-4 grid place-items-center">
                        <span className="h-2 w-2 rounded-full bg-cyan-glow animate-pulse" />
                      </span>
                    )}
                    {i === stage ? (
                      <Typewriter text={s} speed={20} className="text-foreground" />
                    ) : (
                      <span className={i < stage ? "text-muted-foreground line-through" : ""}>
                        {s}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {stage >= STAGES.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-electric to-neon px-6 py-3 font-medium text-background shadow-[var(--glow-electric)]"
                  >
                    View Heatmap <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DropTile({
  icon: Icon,
  label,
  hint,
  done,
  onClick,
}: {
  icon: typeof Upload;
  label: string;
  hint: string;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <HoloCard glow={done}>
      <div className="flex items-center justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-electric to-cyan-glow">
          <Icon className="h-5 w-5 text-background" />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">{label.toUpperCase()}</span>
      </div>
      <h3 className="mt-5 font-display text-xl">{label}</h3>
      <button
        onClick={onClick}
        className={`mt-3 w-full rounded-xl border-2 border-dashed px-4 py-8 text-center transition-all ${
          done
            ? "border-success/40 bg-success/5"
            : "border-white/10 hover:border-cyan-glow/40 hover:bg-cyan-glow/5"
        }`}
      >
        {done ? (
          <div className="flex items-center justify-center gap-2 text-success">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-mono text-sm">INGESTED</span>
          </div>
        ) : (
          <>
            <Upload className="h-6 w-6 mx-auto text-cyan-glow" />
            <div className="mt-2 text-sm">Drop or click to upload</div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
              {hint}
            </div>
          </>
        )}
      </button>
    </HoloCard>
  );
}

export function Header({
  step,
  title,
  sub,
}: {
  step: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="mb-10 flex items-end justify-between gap-6 flex-wrap">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-glow">
          // step {step}
        </div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold">
          {title.split(" ").slice(0, -1).join(" ")}{" "}
          <span className="gradient-text">{title.split(" ").slice(-1)}</span>
        </h1>
        <p className="mt-2 text-muted-foreground">{sub}</p>
      </div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        sequence · 07
      </div>
    </div>
  );
}
