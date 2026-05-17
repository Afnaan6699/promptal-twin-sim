import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Brain, BookOpen, Mic2, Eye, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import { BentoCard } from "@/components/BentoCard";
import { Header } from "./upload";
import { CircleScore } from "@/components/CircleScore";

export const Route = createFileRoute("/report")({
  component: Report,
  head: () => ({ meta: [{ title: "Replay & Coaching · Promptal AI" }] }),
});

const TIMELINE = [
  { q: "Why Node over Django?", note: "Good structure but lacked depth on event loop.", tag: "Decent", c: "brand-accent" },
  { q: "Architect chat for 1M users.", note: "Strong technical answer. Mentioned pub/sub, sharding.", tag: "Strong", c: "success" },
  { q: "Explain Python decorators.", note: "Avoid overexplaining. Got to the point too late.", tag: "Wobbly", c: "brand-secondary" },
  { q: "Risky ship story.", note: "Excellent STAR format. Showed ownership.", tag: "Strong", c: "success" },
  { q: "Re-answer in 30s.", note: "Cut to signal. Confidence dipped under pressure.", tag: "Pressure", c: "danger" },
] as const;

function Report() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-24 space-y-6">
      <Header title="Replay & AI Coaching" sub="Detailed feedback on your performance and areas for improvement." />

      {/* Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        {[
          { icon: Mic2, label: "Speech Clarity", v: 78, c: "brand-primary" as const },
          { icon: Brain, label: "Confidence", v: 64, c: "brand-secondary" as const },
          { icon: Eye, label: "Eye Contact", v: 71, c: "brand-accent" as const },
          { icon: TrendingUp, label: "Energy", v: 82, c: "success" as const },
        ].map((m) => (
          <BentoCard key={m.label} className="flex flex-col items-center text-center p-8 bg-white/80">
            <CircleScore value={m.v} label={m.label} color={m.c} size={130} />
            <div className="mt-6 flex flex-col items-center">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 text-slate-500 mb-3">
                <m.icon className="h-4 w-4" />
              </div>
              <div className="text-sm font-medium text-slate-500">
                {m.v > 75 ? "Strong baseline" : m.v > 60 ? "Room to grow" : "Needs Practice"}
              </div>
            </div>
          </BentoCard>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Strong Areas */}
        <BentoCard className="bg-white/80 border-t-4 border-t-[#10B981]">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 className="h-6 w-6 text-[#10B981]" />
            <h3 className="font-display text-xl font-bold text-slate-900">Strong Areas</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-[#10B981]" />
              <div>
                <div className="font-semibold text-slate-900">STAR Method Application</div>
                <div className="text-sm text-slate-600 mt-1">Excellent behavioral examples with clear business impact.</div>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-[#10B981]" />
              <div>
                <div className="font-semibold text-slate-900">System Design Structure</div>
                <div className="text-sm text-slate-600 mt-1">Good use of whiteboarding principles and scalability limits.</div>
              </div>
            </li>
          </ul>
        </BentoCard>

        {/* Weak Areas */}
        <BentoCard className="bg-white/80 border-t-4 border-t-[#EF4444]">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="h-6 w-6 text-[#EF4444]" />
            <h3 className="font-display text-xl font-bold text-slate-900">Areas to Improve</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-[#EF4444]" />
              <div>
                <div className="font-semibold text-slate-900">Concision under Pressure</div>
                <div className="text-sm text-slate-600 mt-1">Tendency to over-explain technical trade-offs when stressed.</div>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-[#EF4444]" />
              <div>
                <div className="font-semibold text-slate-900">Eye Contact</div>
                <div className="text-sm text-slate-600 mt-1">Looking away for extended periods while recalling complex topics.</div>
              </div>
            </li>
          </ul>
        </BentoCard>
      </div>

      {/* Timeline */}
      <BentoCard className="bg-white/80">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-display text-2xl font-bold text-slate-900">Timeline Feedback</h3>
          <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">5 questions · 12m 04s</div>
        </div>
        
        <div className="relative">
          <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-slate-100" />
          <div className="space-y-8">
            {TIMELINE.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative pl-12"
              >
                <div className="absolute left-0 top-1.5 h-8 w-8 rounded-full border-[3px] border-white shadow-sm flex items-center justify-center bg-white text-xs font-bold text-slate-700 z-10">
                  {i + 1}
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div className="font-semibold text-lg text-slate-900">{t.q}</div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    t.c === "success" ? "bg-[#10B981]/10 text-[#10B981]" :
                    t.c === "danger" ? "bg-[#EF4444]/10 text-[#EF4444]" :
                    t.c === "brand-secondary" ? "bg-[#A855F7]/10 text-[#A855F7]" :
                    "bg-[#3B82F6]/10 text-[#3B82F6]"
                  }`}>
                    {t.tag}
                  </span>
                </div>
                <div className="text-slate-600 mt-2 bg-slate-50 rounded-lg p-3 border border-slate-100 italic">
                  "{t.note}"
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </BentoCard>

      <div className="flex justify-end mt-12">
        <Link
          to="/timemachine"
          className="inline-flex items-center gap-2 rounded-xl bg-[#6C63FF] px-8 py-4 font-semibold text-white shadow-lg shadow-[#6C63FF]/30 hover:-translate-y-0.5 hover:shadow-xl hover:bg-[#5a52d5] transition-all"
        >
          View Career Roadmap <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
