import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Mic, Radio, RotateCcw, StopCircle, Video, Volume2, VolumeX } from "lucide-react";
import { BentoCard } from "@/components/BentoCard";
import { Header } from "./upload";
import { AIAvatar } from "@/components/AIAvatar";
import { useInterviewAI } from "@/hooks/useInterviewAI";
export const Route = createFileRoute("/interview")({
  component: Interview,
  head: () => ({ meta: [{ title: "Live Session - Promptal AI" }] }),
});

type InterviewContext = {
  role: string;
  jd: string;
  resumeName?: string;
  analysis?: unknown;
  twin?: {
    name: string;
    role: string;
    difficulty: string;
    style: string;
    speciality: string;
  };
};

type QuestionState = {
  question: string;
  difficulty: string;
  topic: string;
  intent?: string;
};

type InterviewTurn = QuestionState & {
  answer: string;
  feedback: string;
  score: number;
  scoreCriteria: string;
  strengths: string[];
  improvements: string[];
  durationSeconds: number;
};

const TOTAL_QUESTIONS = 6;

function useBiometricAnalysis(stream: MediaStream | null, videoElement: HTMLVideoElement | null, listening: boolean) {
  const [metrics, setMetrics] = useState({ voice: 72, pace: 65, clarity: 81 });

  useEffect(() => {
    if (!stream || !videoElement) return;
    const t = setInterval(() => {
      setMetrics({
        voice: 70 + Math.random() * 12 + (listening ? 4 : 0),
        pace: 58 + Math.random() * 18,
        clarity: 76 + Math.random() * 14,
      });
    }, 1600);
    return () => clearInterval(t);
  }, [stream, videoElement, listening]);

  return { metrics };
}

function readContext(): InterviewContext {
  if (typeof window === "undefined") {
    return fallbackContext();
  }

  const saved = sessionStorage.getItem("ai_interview_context");
  if (saved) return JSON.parse(saved);

  return fallbackContext();
}

function fallbackContext(): InterviewContext {
  return {
    role: "Frontend Developer",
    jd: "Build user-facing products with React, strong communication, and practical system design.",
    twin: {
      name: "David",
      role: "FAANG Engineer",
      difficulty: "Hard",
      style: "Surgical & Deep",
      speciality: "System Design",
    },
  };
}

// Gemini API logic removed in favor of local Ollama hooks

function Interview() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");
  const isListeningRef = useRef(false);
  const questionStartedAtRef = useRef(Date.now());
  const evaluateAnswerRef = useRef<(answer: string) => void>(() => {});

  const [context, setContext] = useState<InterviewContext>(() => readContext());
  const [questionIndex, setQuestionIndex] = useState(0);
  const [time, setTime] = useState(0);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speechMessage, setSpeechMessage] = useState("");
  const [speechReady, setSpeechReady] = useState(true);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  const {
    turns,
    currentQuestion,
    isEvaluating,
    isThinking,
    aiFeedback,
    startInterview,
    submitAnswer,
  } = useInterviewAI(context.role);

  const { metrics } = useBiometricAnalysis(activeStream, videoRef.current, isListening);
  const twinName = context.twin?.name || "David";
  const complete = turns.length >= TOTAL_QUESTIONS;

  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) {
      setSpeechReady(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = context.twin?.name === "Alex" ? 1.12 : 0.96;
    
    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const setTranscriptRef = useRef<(v: string) => void>(() => {});
  setTranscriptRef.current = (value: string) => {
    transcriptRef.current = value;
    setTranscript(value);
  };

  const updateTranscript = (value: string) => {
    transcriptRef.current = value;
    setTranscript(value);
  };

  const saveSession = (nextTurns: InterviewTurn[]) => {
    sessionStorage.setItem(
      "ai_interview_session",
      JSON.stringify({
        context,
        turns: nextTurns,
        metrics,
        durationSeconds: time,
        completedAt: new Date().toISOString(),
      }),
    );
  };

  const evaluateAnswer = async (answer: string) => {
    const cleanAnswer = answer.trim();
    if (!cleanAnswer || complete) return;

    setSpeechMessage("Analyzing answer...");
    const nextQ = await submitAnswer(cleanAnswer);
    
    updateTranscript("");
    
    if (nextQ) {
      setQuestionIndex((prev) => prev + 1);
      questionStartedAtRef.current = Date.now();
      setSpeechMessage("Next question ready. Speak when you are ready.");
      speakText(nextQ);
    }
  };

  useEffect(() => {
    evaluateAnswerRef.current = evaluateAnswer;
  }, [evaluateAnswer]);

  useEffect(() => {
    const nextContext = readContext();
    setContext(nextContext);
    
    // Start Ollama flow
    startInterview().then((firstQ) => {
      speakText(firstQ);
    });
  }, [startInterview]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechMessage("Speech recognition is not available in this browser. Type your answer below.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let currentTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      const trimmed = currentTranscript.trim();
      transcriptRef.current = trimmed;
      setTranscriptRef.current(trimmed);
      setSpeechMessage("Transcript captured. Stop when your answer is ready.");
    };

    recognition.onerror = (event: any) => {
      isListeningRef.current = false;
      setIsListening(false);
      setSpeechMessage(
        event?.error === "not-allowed"
          ? "Microphone permission is blocked. Allow mic access or type your answer below."
          : "Speech capture paused. You can try again or type your answer below.",
      );
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      setIsListening(false);
      const val = transcriptRef.current;
      if (val.trim()) {
         setSpeechMessage("Transcribed. Auto-submitting...");
         evaluateAnswerRef.current?.(val);
      } else {
         setSpeechMessage("No speech was captured. Try again or type your answer.");
      }
    };

    recognitionRef.current = recognition;
  }, []);

  // removed redundant useEffect

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort?.();
    };
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreamActive(true);
          setActiveStream(stream);
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    }
    setupCamera();
    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const toggleSpeak = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (isListening) {
      recognitionRef.current?.stop();
      isListeningRef.current = false;
      setIsListening(false);
      
      const val = transcriptRef.current;
      if (val.trim()) {
        evaluateAnswer(val);
      }
      return;
    }

    updateTranscript("");
    setSpeechMessage("Listening...");
    if (!recognitionRef.current) {
      setSpeechMessage("Speech recognition is not available here. Type your answer below.");
      return;
    }

    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel(); // Stop AI speaking when user starts talking
        setIsAiSpeaking(false);
      }
      recognitionRef.current.start();
      isListeningRef.current = true;
      setIsListening(true);
    } catch (e) {
      console.error("Speech recognition error", e);
      setSpeechMessage("Speech capture could not start. Type your answer below.");
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-24">
      <Header title="Live Interview Session" sub="Your AI Twin asks role-specific questions, listens to your answer, and tracks coaching signals." />

      <div className="grid lg:grid-cols-[1fr_350px] gap-6 mt-8">
        <BentoCard className="p-0 overflow-hidden flex flex-col bg-slate-50 border border-slate-200 shadow-xl">
          <div className="relative flex-1 min-h-[500px] bg-slate-950 overflow-hidden rounded-t-[23px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(108,99,255,0.22),transparent_34%),linear-gradient(135deg,#020617,#111827_55%,#0f172a)]" />

            <div className="absolute inset-0 grid place-items-center">
              <AIAvatar 
                isListening={isListening} 
                isThinking={isThinking || isEvaluating} 
                isSpeaking={isAiSpeaking} 
              />
            </div>

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute bottom-6 right-6 h-48 w-36 rounded-2xl object-cover shadow-2xl border-2 border-white/10 ${isStreamActive ? "opacity-100" : "opacity-0"}`}
            />

            <div className="absolute top-6 left-6 right-6 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white shadow-sm border border-white/10">
                <span className="h-2 w-2 rounded-full bg-[#EF4444] animate-pulse" /> REC - TWIN: {twinName.toUpperCase()}
              </div>
              <div className="flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white shadow-sm border border-white/10">
                {String(Math.floor(time / 60)).padStart(2, "0")}:{String(time % 60).padStart(2, "0")}
              </div>
            </div>

            <div className="absolute bottom-6 left-6 right-48 max-w-2xl rounded-2xl bg-black/45 backdrop-blur-md p-6 border border-white/10 shadow-lg">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#93C5FD]">
                <span>Question {Math.min(questionIndex + 1, TOTAL_QUESTIONS)} of {TOTAL_QUESTIONS}</span>
                <span className="rounded-full bg-white/10 px-2 py-1 text-white/80">{currentQuestion.topic}</span>
                <span className="rounded-full bg-white/10 px-2 py-1 text-white/80">{currentQuestion.difficulty}</span>
              </div>
              <div className="mt-3 text-xl font-medium text-white leading-snug">
                {isThinking ? "Analyzing and generating response..." : currentQuestion.question}
              </div>
              {!speechReady && <div className="mt-3 text-xs text-amber-200">Voice playback is not available in this browser.</div>}
            </div>
          </div>

          <div className="min-h-24 bg-white px-8 py-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 rounded-b-[23px]">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSpeak}
                disabled={isThinking || isEvaluating || complete}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors disabled:opacity-40 ${
                  isListening ? "bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-lg shadow-[#EF4444]/30" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                title={isListening ? "Stop answer" : "Start answer"}
              >
                {isListening ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
              <button className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors" title="Camera active">
                <Video className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  if (isAiSpeaking) {
                    window.speechSynthesis.cancel();
                    setIsAiSpeaking(false);
                  } else {
                    speakText(currentQuestion.question);
                  }
                }}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                  isAiSpeaking
                    ? "bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-lg shadow-[#EF4444]/30"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                title={isAiSpeaking ? "Stop AI speaking" : "Replay question"}
              >
                {isAiSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <div className="text-sm font-medium text-slate-500">
                {isListening ? "Listening to your answer..." : isAiSpeaking ? "AI is speaking — click 🔇 to stop" : isEvaluating ? "Analyzing answer..." : complete ? "Session complete" : "Press mic to answer"}
              </div>
            </div>
            {complete ? (
              <Link
                to="/report"
                className="flex items-center gap-2 rounded-full bg-[#10B981] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#10B981]/30 hover:bg-[#059669] transition-colors"
              >
                View Coaching Report <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                disabled={true}
                className="flex items-center gap-2 rounded-full bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-400 shadow-sm transition-colors"
              >
                Auto Submit Active
              </button>
            )}
          </div>
        </BentoCard>

        <div className="flex flex-col gap-6">
          <BentoCard className="bg-white/80">
            <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Radio className="h-4 w-4 text-[#6C63FF]" /> Live Biometrics
            </h3>
            <div className="space-y-6">
              <MetricRow label="Voice Stability" value={metrics.voice} color="bg-[#6C63FF]" />
              <MetricRow label="Speaking Pace" value={metrics.pace} color="bg-[#3B82F6]" />
              <MetricRow label="Clarity Index" value={metrics.clarity} color="bg-[#10B981]" />
            </div>
          </BentoCard>

          <BentoCard className="bg-white/80 flex flex-col">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center justify-between">
              Live Transcript
              {isListening && <span className="flex h-2 w-2 rounded-full bg-[#EF4444] animate-pulse" />}
            </h3>
            <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100 overflow-y-auto min-h-[140px] text-sm text-slate-600 leading-relaxed font-medium">
              {transcript || <span className="text-slate-400 italic">Click the microphone to start speaking...</span>}
            </div>
            <textarea
              value={transcript}
              onChange={(event) => updateTranscript(event.target.value)}
              placeholder="Speak with the mic, or type your answer here if voice capture is unavailable..."
              className="mt-3 min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#6C63FF] focus:outline-none focus:ring-1 focus:ring-[#6C63FF]"
            />
            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
              <span>{speechMessage || "Your spoken words will appear here live."}</span>
              <button
                onClick={() => updateTranscript("")}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-200"
              >
                <RotateCcw className="h-3 w-3" /> Clear
              </button>
            </div>
            {aiFeedback && (
              <div className="mt-3 p-3 rounded-lg bg-[#10B981]/10 text-slate-700 text-sm border border-[#10B981]/20">
                <span className="font-bold text-[#047857]">{twinName}: </span>{aiFeedback}
              </div>
            )}
            {turns.length > 0 && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Answer History</div>
                <div className="mt-3 space-y-3">
                  {turns.map((turn, index) => (
                    <div key={`${turn.question}-${index}`} className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                      <div className="text-xs font-semibold text-slate-500">Q{index + 1} Transcript</div>
                      <div className="mt-1 text-sm text-slate-700">{turn.answer}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </BentoCard>

          <BentoCard className="bg-white/80">
            <h3 className="font-semibold text-slate-900 mb-4">Session Tracker</h3>
            <div className="space-y-3">
              {Array.from({ length: TOTAL_QUESTIONS }, (_, index) => {
                const turn = turns[index];
                return (
                  <div key={index} className="flex flex-col gap-2 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Question {index + 1}</span>
                      <span className={`text-xs font-bold ${turn ? "text-[#10B981]" : index === turns.length ? "text-[#6C63FF]" : "text-slate-400"}`}>
                        {turn ? `${turn.score}/10` : index === turns.length ? "Live" : "Pending"}
                      </span>
                    </div>
                    {turn && turn.feedback && (
                      <div className="text-xs text-slate-500 italic mt-1 border-t border-slate-100 pt-2">
                        <span className="font-semibold text-slate-600">Feedback:</span> {turn.feedback}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </BentoCard>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm font-semibold mb-2">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-900">{Math.round(value)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <motion.div animate={{ width: `${value}%` }} className={`h-full rounded-full ${color}`} />
      </div>
    </div>
  );
}
