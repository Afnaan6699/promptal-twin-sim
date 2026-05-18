import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Briefcase, Target, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { BentoCard } from "@/components/BentoCard";
import { analyzeProfile } from "../server/analyze";
import { toast } from "sonner";
export const Route = createFileRoute("/upload")({
  component: UploadPage,
  head: () => ({
    meta: [
      { title: "Upload · Promptal AI" },
      { name: "description", content: "Upload your resume and job description." },
    ],
  }),
});

const STAGES = [
  "Extracting candidate experience...",
  "Analyzing skill gaps...",
  "Mapping to job requirements...",
  "Calibrating interview difficulty...",
  "Ready for Simulation.",
];

function scoreFromText(text: string, terms: string[], base = 48) {
  const haystack = text.toLowerCase();
  const hits = terms.filter((term) => haystack.includes(term.toLowerCase())).length;
  return Math.min(94, base + hits * 8);
}

function extractSkillHints(jd: string) {
  const known = [
    "React",
    "TypeScript",
    "JavaScript",
    "Node.js",
    "Python",
    "Java",
    "SQL",
    "MongoDB",
    "AWS",
    "Docker",
    "Kubernetes",
    "Machine Learning",
    "LLM",
    "API",
    "System Design",
    "Communication",
  ];
  const matched = known.filter((skill) => jd.toLowerCase().includes(skill.toLowerCase()));
  return (matched.length ? matched : ["React", "API", "Communication", "System Design", "Problem Solving", "Ownership"]).slice(0, 6);
}

function localProfileAnalysis({ jd, role, resumeName }: { jd: string; role: string; resumeName: string }) {
  const skillHints = extractSkillHints(`${jd} ${role} ${resumeName}`);
  const technical = scoreFromText(`${jd} ${role}`, ["react", "typescript", "api", "system", "database", "cloud", "ai", "machine"], 54);
  const communication = scoreFromText(jd, ["stakeholder", "communication", "collaborate", "present", "client"], 58);
  const roleMatch = scoreFromText(`${jd} ${role}`, role.split(/\s+/).filter(Boolean), 60);
  const confidence = Math.round((technical + communication + roleMatch) / 3) - 4;

  return {
    hiringProbability: Math.max(52, Math.min(91, Math.round((technical + communication + roleMatch) / 3))),
    scores: [
      { l: "Technical", v: technical },
      { l: "Communication", v: communication },
      { l: "Confidence", v: confidence },
      { l: "Role Match", v: roleMatch },
    ],
    radarData: [
      technical,
      communication,
      Math.max(45, technical - 8),
      Math.max(50, communication + 4),
      Math.max(46, confidence),
      roleMatch,
    ],
    skills: skillHints.map((name, index) => ({
      name,
      level: Math.max(42, Math.min(92, technical - index * 5 + (index % 2) * 6)),
    })),
    strengths: [
      `Relevant preparation for ${role}`,
      "Clear role intent from the job description",
      "Good foundation for targeted mock interviews",
    ],
    techStack: skillHints.slice(0, 4),
    watchOuts: [
      "Add quantified project outcomes",
      "Prepare deeper trade-off explanations",
      "Practice concise spoken answers",
    ],
    missingForRole: skillHints.slice(-3).map((skill) => `Prove hands-on depth in ${skill}`),
    source: "local-fallback",
  };
}

function withTimeout<T>(promiseFactory: () => Promise<T>, fallback: T, ms = 45000): Promise<T> {
  return Promise.race([
    Promise.resolve().then(promiseFactory).catch(() => fallback),
    new Promise<T>((resolve) => {
      window.setTimeout(() => resolve(fallback), ms);
    }),
  ]);
}

function UploadPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [role, setRole] = useState("");
  const [scanning, setScanning] = useState(false);
  const [stage, setStage] = useState(0);
  const ready = resumeFile !== null && jdText.trim().length > 10 && role.trim().length > 1;

  const handleAnalyze = async () => {
    if (!ready) return;
    setScanning(true);
    setStage(0);

    // Simulate progress while waiting for the API
    const progressInterval = setInterval(() => {
      setStage((s) => Math.min(s + 1, STAGES.length - 2));
    }, 1500);

    try {
      const formData = new FormData();
      formData.append("file", resumeFile);
      formData.append("jd", jdText);
      formData.append("role", role);

      const fallback = localProfileAnalysis({ jd: jdText, role, resumeName: resumeFile.name });
      const result = await withTimeout(() => analyzeProfile({ data: formData }), fallback);
      
      clearInterval(progressInterval);
      setStage(STAGES.length - 1); // "Analysis Complete"

      // Store the result globally
      sessionStorage.setItem("ai_analysis_result", JSON.stringify(result));
      sessionStorage.setItem(
        "ai_interview_context",
        JSON.stringify({
          role,
          jd: jdText,
          resumeName: resumeFile.name,
          analysis: result,
        }),
      );
      sessionStorage.removeItem("ai_interview_session");
      if ((result as any).source === "local-fallback") {
        toast.info("Analysis generated locally. Add a Gemini API key for deeper resume parsing.");
      }
    } catch (error: any) {
      const fallback = localProfileAnalysis({ jd: jdText, role, resumeName: resumeFile.name });
      sessionStorage.setItem("ai_analysis_result", JSON.stringify(fallback));
      sessionStorage.setItem(
        "ai_interview_context",
        JSON.stringify({
          role,
          jd: jdText,
          resumeName: resumeFile.name,
          analysis: fallback,
        }),
      );
      sessionStorage.removeItem("ai_interview_session");
      clearInterval(progressInterval);
      setStage(STAGES.length - 1);
      console.error(error);
      toast.info("AI service was unavailable, so a local analysis was generated for the demo.");
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-24">
      <Header title="Profile Setup" sub="Provide your resume and job details to personalize the AI Twin." />

      <AnimatePresence mode="wait">
        {!scanning ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid lg:grid-cols-4 gap-6"
          >
            {/* Card 1: Resume */}
            <DropTile
              icon={FileText}
              label="Resume"
              hint="PDF or DOCX (Max 5MB)"
              done={resumeFile !== null}
              onFileSelect={setResumeFile}
              accept=".pdf,.docx,.doc"
              className="lg:col-span-1"
            />

            {/* Card 2: JD */}
            <BentoCard className="lg:col-span-1 flex flex-col">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#3B82F6]/10 text-[#3B82F6]">
                  <Briefcase className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-slate-900">Job Description</h3>
              </div>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the job description here..."
                className="mt-4 w-full flex-1 resize-none rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF] transition-all"
              />
            </BentoCard>

            {/* Card 3: Target Role */}
            <BentoCard className="lg:col-span-1">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#A855F7]/10 text-[#A855F7]">
                  <Target className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-slate-900">Target Role</h3>
              </div>
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="mt-4 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF] transition-all"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {["FAANG SWE", "Product Designer", "AI Engineer"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setRole(p)}
                    className="text-xs font-medium text-slate-500 hover:text-[#6C63FF] bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:border-[#6C63FF]/30 hover:bg-[#6C63FF]/5 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </BentoCard>

            {/* Card 4: Status & CTA */}
            <BentoCard className="lg:col-span-1 flex flex-col justify-between bg-gradient-to-br from-[#6C63FF]/5 to-transparent border-none">
              <div>
                <h3 className="font-semibold text-slate-900">AI Scan Status</h3>
                <div className="mt-4 space-y-3">
                  <StatusRow label="Resume Uploaded" active={resumeFile !== null} />
                  <StatusRow label="Job Description" active={jdText.trim().length > 10} />
                  <StatusRow label="Role Defined" active={role.trim().length > 1} />
                </div>
              </div>
              <button
                disabled={!ready}
                onClick={handleAnalyze}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-[#6C63FF] px-6 py-3.5 text-sm font-semibold text-white shadow-md disabled:opacity-50 disabled:shadow-none hover:bg-[#5a52d5] transition-colors"
              >
                Analyze Profile
                <ArrowRight className="h-4 w-4" />
              </button>
            </BentoCard>
          </motion.div>
        ) : (
          <motion.div
            key="scan"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <BentoCard className="p-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#6C63FF]/10 grid place-items-center">
                  {stage < STAGES.length - 1 ? (
                    <Loader2 className="h-5 w-5 text-[#6C63FF] animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  {stage < STAGES.length - 1 ? "Analyzing Profile..." : "Analysis Complete"}
                </h2>
              </div>

              <div className="mt-8 space-y-4">
                {STAGES.slice(0, stage + 1).map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {i < stage ? (
                      <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-[#6C63FF] border-t-transparent animate-spin" />
                    )}
                    <span className={i < stage ? "text-slate-500 font-medium" : "text-slate-900 font-semibold"}>
                      {s}
                    </span>
                  </div>
                ))}
              </div>

              {stage >= STAGES.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 pt-6 border-t border-slate-100"
                >
                  <Link
                    to="/dashboard"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6C63FF] px-6 py-3.5 font-semibold text-white shadow-md hover:bg-[#5a52d5] transition-colors"
                  >
                    View Analysis Dashboard <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              )}
            </BentoCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusRow({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`grid h-5 w-5 place-items-center rounded-full ${active ? "bg-[#10B981]" : "bg-slate-200"}`}>
        <CheckCircle2 className={`h-3 w-3 ${active ? "text-white" : "text-slate-400"}`} />
      </div>
      <span className={active ? "text-slate-900 font-medium" : "text-slate-500"}>{label}</span>
    </div>
  );
}

function DropTile({
  icon: Icon,
  label,
  hint,
  done,
  onFileSelect,
  accept,
  className = "",
}: {
  icon: typeof Upload;
  label: string;
  hint: string;
  done: boolean;
  onFileSelect: (file: File) => void;
  accept?: string;
  className?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!done) {
      fileInputRef.current?.click();
    }
  };

  return (
    <BentoCard glow={done} className={className}>
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#6C63FF]/10 text-[#6C63FF]">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="font-semibold text-slate-900">{label}</h3>
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }} 
        accept={accept}
        className="hidden" 
      />
      <button
        onClick={handleClick}
        className={`mt-4 w-full h-[120px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
          done
            ? "border-[#10B981]/40 bg-[#10B981]/5"
            : "border-slate-300 hover:border-[#6C63FF]/40 hover:bg-[#6C63FF]/5 bg-slate-50"
        }`}
      >
        {done ? (
          <div className="flex flex-col items-center gap-2 text-[#10B981]">
            <CheckCircle2 className="h-6 w-6" />
            <span className="text-sm font-semibold">Uploaded</span>
          </div>
        ) : (
          <>
            <Upload className="h-5 w-5 text-slate-400 mb-2" />
            <div className="text-sm font-medium text-slate-700">Drag & Drop</div>
            <div className="text-xs text-slate-500 mt-1">{hint}</div>
          </>
        )}
      </button>
    </BentoCard>
  );
}

export function Header({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
      <p className="mt-2 text-slate-600 text-lg">{sub}</p>
    </div>
  );
}
