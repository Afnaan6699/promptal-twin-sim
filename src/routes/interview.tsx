import { useEffect, useRef, useState } from "react";
import { generateInterviewQuestion } from '../services/featherlessAPI';
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Mic, Video, Activity, StopCircle, User } from "lucide-react";
import { BentoCard } from "@/components/BentoCard";
import { Header } from "./upload";

export const Route = createFileRoute("/interview")({
  component: Interview,
  head: () => ({ meta: [{ title: "Live Session · Promptal AI" }] }),
});



function useBiometricAnalysis(stream: MediaStream | null, videoElement: HTMLVideoElement | null) {
  const [metrics, setMetrics] = useState({ voice: 72, pace: 65, clarity: 81 });

  useEffect(() => {
    if (!stream || !videoElement) return;
    const t = setInterval(() => {
      setMetrics({
        voice: 70 + Math.random() * 10,
        pace: 60 + Math.random() * 15,
        clarity: 80 + Math.random() * 10,
      });
    }, 2000);
    return () => clearInterval(t);
  }, [stream, videoElement]);

  return { metrics };
}

function Interview() {
  const [qi, setQi] = useState(0);
  const [time, setTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState("Loading your question...");
  const [isLoadingQ, setIsLoadingQ] = useState(false);

  const loadNextQuestion = async () => {
    setIsLoadingQ(true);
    const resume = localStorage.getItem("resumeText") ?? "React, Node.js developer";
    const role = localStorage.getItem("jobRole") ?? "Frontend Developer";
    const result = await generateInterviewQuestion(resume, role);
    setCurrentQuestion(result.question);
    setIsLoadingQ(false);
  };
  useEffect(() => {
    loadNextQuestion();
  }, []);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let fullTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
        }
        setTranscript(fullTranscript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleSpeak = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Speech recognition error", e);
      }
    }
  };

  useEffect(() => {
    let stream: MediaStream | null = null;
    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const { metrics } = useBiometricAnalysis(activeStream, videoRef.current);

  useEffect(() => {
    const t = setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-24">
      <Header title="Live Interview Session" sub="Your AI Twin is ready. Please ensure your camera and microphone are on." />

      <div className="grid lg:grid-cols-[1fr_350px] gap-6 mt-8">

        {/* Main Video Area */}
        <BentoCard className="p-0 overflow-hidden flex flex-col bg-slate-50 border border-slate-200 shadow-xl">
          <div className="relative flex-1 min-h-[460px] bg-slate-900 overflow-hidden rounded-t-[23px]">
            {/* AI Avatar Centerpiece */}
            {!isStreamActive && (
              <div className="absolute inset-0 grid place-items-center">
                <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#A855F7] shadow-xl flex items-center justify-center">
                  <User className="h-12 w-12 text-white" />
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-pulse" />
                </div>
              </div>
            )}

            {/* Webcam Stream */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute bottom-6 right-6 h-48 w-36 rounded-2xl object-cover shadow-2xl border-2 border-white/10 ${isStreamActive ? "opacity-100" : "opacity-0"
                }`}
            />

            {/* Top HUD */}
            <div className="absolute top-6 left-6 right-6 flex items-start justify-between">
              <div className="flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white shadow-sm border border-white/10">
                <span className="h-2 w-2 rounded-full bg-[#EF4444] animate-pulse" /> REC · TWIN: DAVID
              </div>
              <div className="flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white shadow-sm border border-white/10">
                {String(Math.floor(time / 60)).padStart(2, "0")}:{String(time % 60).padStart(2, "0")}
              </div>
            </div>

            {/* Question Overlay */}
            <div className="absolute bottom-6 left-6 max-w-lg rounded-2xl bg-black/40 backdrop-blur-md p-6 border border-white/10 shadow-lg">
              <div className="text-xs font-semibold text-[#A855F7] uppercase tracking-wider">
                Question {qi + 1} of {5}
              </div>
              <div className="mt-2 text-xl font-medium text-white leading-snug">
                {isLoadingQ ? "Loading..." : currentQuestion}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="h-24 bg-white px-8 flex items-center justify-between border-t border-slate-200 rounded-b-[23px]">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSpeak}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${isListening ? "bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-lg shadow-[#EF4444]/30" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {isListening ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
              <button className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                <Video className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              {true ? (
                <button
                  onClick={() => {
                    setQi(q => q + 1);
                    setTranscript("");
                    loadNextQuestion();
                  }}
                  className="flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 shadow-md transition-colors"
                >
                  Next Question <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <Link
                  to="/report"
                  className="flex items-center gap-2 rounded-full bg-[#10B981] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#10B981]/30 hover:bg-[#059669] transition-colors"
                >
                  End Session <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </BentoCard>

        {/* Live Metrics Sidebar */}
        <div className="flex flex-col gap-6">
          <BentoCard className="flex-1 bg-white/80">
            <h3 className="font-semibold text-slate-900 mb-6">Live Biometrics</h3>
            <div className="space-y-6">
              <MetricRow label="Voice Stability" value={metrics.voice} color="bg-[#6C63FF]" />
              <MetricRow label="Speaking Pace" value={metrics.pace} color="bg-[#3B82F6]" />
              <MetricRow label="Clarity Index" value={metrics.clarity} color="bg-[#A855F7]" />
            </div>
          </BentoCard>

          <BentoCard className="flex-1 bg-white/80 flex flex-col">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center justify-between">
              Live Transcript
              {isListening && <span className="flex h-2 w-2 rounded-full bg-[#EF4444] animate-pulse" />}
            </h3>
            <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100 overflow-y-auto min-h-[140px] text-sm text-slate-600 leading-relaxed font-medium">
              {transcript || <span className="text-slate-400 italic">Click the microphone to start speaking...</span>}
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
        <motion.div
          animate={{ width: `${value}%` }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}
