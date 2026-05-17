import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Mic, Video, AlertTriangle, ShieldAlert, Activity } from "lucide-react";
import { HoloCard } from "@/components/HoloCard";
import { Typewriter } from "@/components/Typewriter";
import { Header } from "./upload";

export const Route = createFileRoute("/interview")({
  component: Interview,
  head: () => ({ meta: [{ title: "Live · Promptal AI" }] }),
});

const QUESTIONS = [
  "I noticed React and Node in your projects. Why Node over Django?",
  "Walk me through how you'd architect a real-time chat for 1M concurrent users.",
  "Your resume claims Python ⭐⭐⭐⭐⭐ — explain decorators and the GIL.",
  "Tell me about a time you shipped something risky. What broke?",
  "You're verbose. Can you redo that answer in 30 seconds?",
];

const STRESS = ["You are taking too long.", "Can you justify that?", "That sounds generic.", "I need specifics."];

function useStressAnalysis(stream: MediaStream | null, videoElement: HTMLVideoElement | null) {
  const [pressure, setPressure] = useState(30);
  const [metrics, setMetrics] = useState({ voice: 72, pace: 65, clarity: 81 });

  useEffect(() => {
    if (!stream || !videoElement) return;

    let audioContext: AudioContext;
    let analyser: AnalyserNode;
    let microphone: MediaStreamAudioSourceNode;
    let dataArray: Uint8Array;

    const setupAudio = () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        audioContext = new AudioContextClass();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
      } catch (e) {
        console.error("Audio setup failed", e);
      }
    };

    setupAudio();

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let previousImageData: ImageData | null = null;
    let animationFrameId: number;
    
    let targetVoice = 72;
    let targetPace = 65;
    let targetClarity = 81;
    let lastVolume = 0;
    let volumeSpikes = 0;

    const analyze = () => {
      let audioPressure = 0;
      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        let highFreqSum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
          if (i > dataArray.length / 2) highFreqSum += dataArray[i];
        }
        const avgVolume = sum / dataArray.length;
        const highFreqRatio = highFreqSum / (sum || 1);
        
        audioPressure = Math.min(50, (avgVolume / 64) * 50);
        
        if (avgVolume > 2) {
          const volumeDiff = Math.abs(avgVolume - lastVolume);
          if (volumeDiff > 10) volumeSpikes++;
          targetVoice = Math.min(98, Math.max(45, 90 - volumeDiff));
          targetClarity = Math.min(98, Math.max(50, 60 + highFreqRatio * 150));
          targetPace = Math.min(95, Math.max(50, 50 + volumeSpikes));
        } else {
          volumeSpikes = Math.max(0, volumeSpikes - 0.1);
        }
        lastVolume = avgVolume;
      }

      let motionPressure = 0;
      if (ctx && videoElement.videoWidth > 0) {
        const scale = 0.1;
        if (canvas.width !== Math.floor(videoElement.videoWidth * scale)) {
          canvas.width = Math.floor(videoElement.videoWidth * scale);
          canvas.height = Math.floor(videoElement.videoHeight * scale);
        }
        
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        if (previousImageData) {
          let diffCount = 0;
          const length = currentImageData.data.length;
          for (let i = 0; i < length; i += 4) {
            const rDiff = Math.abs(currentImageData.data[i] - previousImageData.data[i]);
            const gDiff = Math.abs(currentImageData.data[i+1] - previousImageData.data[i+1]);
            const bDiff = Math.abs(currentImageData.data[i+2] - previousImageData.data[i+2]);
            if (rDiff + gDiff + bDiff > 60) {
              diffCount++;
            }
          }
          const totalPixels = canvas.width * canvas.height;
          const diffRatio = diffCount / totalPixels;
          motionPressure = Math.min(50, (diffRatio / 0.1) * 50);
        }
        previousImageData = currentImageData;
      }

      const targetPressure = 15 + audioPressure + motionPressure;
      setPressure(prev => prev + (targetPressure - prev) * 0.05);
      
      setMetrics(prev => ({
        voice: Math.round(prev.voice + (targetVoice - prev.voice) * 0.05),
        pace: Math.round(prev.pace + (targetPace - prev.pace) * 0.05),
        clarity: Math.round(prev.clarity + (targetClarity - prev.clarity) * 0.05)
      }));

      animationFrameId = requestAnimationFrame(analyze);
    };

    analyze();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [stream, videoElement]);

  return { pressure, metrics };
}

function Interview() {
  const [qi, setQi] = useState(0);
  const [stress, setStress] = useState<string | null>(null);
  const [time, setTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
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

  const { pressure: realPressure, metrics } = useStressAnalysis(activeStream, videoRef.current);
  const [pressure, setPressure] = useState(30);

  useEffect(() => {
    setPressure(p => p + (realPressure - p) * 0.1);
  }, [realPressure]);

  useEffect(() => {
    const t = setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const triggerStress = () => {
    setStress(STRESS[Math.floor(Math.random() * STRESS.length)]);
    setPressure((p) => Math.min(100, p + 50));
    setTimeout(() => setStress(null), 2400);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-24">
      <Header step="05" title="Live AI Interview" sub="Voice-on. Camera-on. The Twin is watching." />

      {/* Stress overlay */}
      <AnimatePresence>
        {stress && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 pointer-events-none"
          >
            <div className="absolute inset-0 bg-danger/10 animate-pulse" />
            <div className="absolute inset-0 ring-4 ring-inset ring-danger/40 animate-heartbeat" />
            <div className="absolute top-32 left-1/2 -translate-x-1/2 rounded-2xl glass-strong border border-danger/60 px-6 py-4 shadow-[var(--glow-danger)]">
              <div className="flex items-center gap-2 text-danger font-mono uppercase tracking-widest text-xs">
                <AlertTriangle className="h-4 w-4" /> stress vector
              </div>
              <div className="mt-1 font-display text-2xl">{stress}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        {/* AI Twin viewport */}
        <HoloCard glow className="relative overflow-hidden min-h-[460px]">
          <div className="absolute inset-0">
            <div className="absolute inset-0 grid place-items-center">
              {[0.5, 0.7, 0.9].map((s, i) => (
                <div
                  key={i}
                  className="absolute rounded-full border border-electric/20 animate-spin-slow"
                  style={{
                    width: `${s * 80}%`,
                    height: `${s * 80}%`,
                    animationDuration: `${16 + i * 4}s`,
                    animationDirection: i % 2 ? "reverse" : "normal",
                  }}
                />
              ))}
              <div className="relative h-40 w-40 rounded-full bg-gradient-to-br from-electric to-neon shadow-[var(--glow-neon)] grid place-items-center">
                <div className="text-6xl">🧠</div>
                <div className="absolute inset-0 rounded-full border border-white/40 animate-pulse-glow" />
              </div>
            </div>
            <div className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-cyan-glow/20 to-transparent animate-scan" />
          </div>

          {/* HUD overlays */}
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-2 rounded-lg glass px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-cyan-glow">
              <span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse" /> REC · TWIN: VANCE
            </div>
            <div className="flex items-center gap-2 rounded-lg glass px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <Activity className="h-3 w-3 text-success" /> {String(Math.floor(time / 60)).padStart(2, "0")}:{String(time % 60).padStart(2, "0")}
            </div>
          </div>

          {/* Question box */}
          <div className="absolute bottom-5 left-5 right-5 rounded-xl glass-strong border border-cyan-glow/30 p-4 max-h-[60%] overflow-y-auto">
            <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-glow">
              twin says · Q{qi + 1}/{QUESTIONS.length}
            </div>
            <div className="mt-2 font-display text-lg leading-snug">
              <Typewriter key={qi} text={QUESTIONS[qi]} speed={22} />
            </div>
            
            {transcript && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 border-t border-white/10 pt-4">
                <div className="text-[10px] font-mono uppercase tracking-widest text-pink-glow flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-glow animate-pulse" /> you say
                </div>
                <div className="mt-2 font-display text-base text-muted-foreground leading-snug italic">
                  "{transcript}"
                </div>
              </motion.div>
            )}

            {/* voice wave */}
            {!transcript && (
              <div className="mt-3 flex items-end gap-1 h-8">
                {Array.from({ length: 28 }).map((_, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-gradient-to-t from-electric to-neon shadow-[0_0_6px_var(--electric)]"
                    style={{
                      height: `${20 + Math.sin(i * 0.7) * 60}%`,
                      animation: `voice-wave ${0.6 + (i % 5) * 0.1}s ease-in-out ${i * 0.04}s infinite`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </HoloCard>

        {/* Side rail */}
        <div className="space-y-5">
          <HoloCard>
            <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-glow">// camera</div>
            <div className="mt-2 aspect-video rounded-xl bg-background/60 border border-white/10 relative overflow-hidden grid place-items-center">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isStreamActive ? 'opacity-100' : 'opacity-0'}`} 
              />
              {!isStreamActive && (
                <>
                  <Video className="h-10 w-10 text-muted-foreground z-10" />
                  <div className="absolute inset-0 grid-bg opacity-40 z-0" />
                </>
              )}
              <div className="absolute top-2 right-2 text-[10px] font-mono text-danger flex items-center gap-1 z-20 bg-background/80 px-2 py-0.5 rounded backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse" /> LIVE
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button 
                onClick={toggleSpeak}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium transition-all ${
                  isListening 
                    ? "bg-danger text-white shadow-[0_0_15px_var(--glow-danger)] animate-pulse" 
                    : "bg-gradient-to-r from-electric to-neon text-background"
                }`}
              >
                {isListening ? <><Mic className="h-4 w-4" /> Listening...</> : <><Mic className="h-4 w-4" /> Speak</>}
              </button>
              <button
                onClick={triggerStress}
                className="inline-flex items-center justify-center gap-2 rounded-xl glass border border-danger/40 px-3 py-2 text-sm text-danger hover:bg-danger/10"
              >
                <ShieldAlert className="h-4 w-4" /> Stress
              </button>
            </div>
          </HoloCard>

          <HoloCard>
            <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-glow">// pressure meter</div>
            <div className="mt-3 h-3 rounded-full bg-white/5 overflow-hidden relative">
              <motion.div
                animate={{ width: `${pressure}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-gradient-to-r from-success via-pink-glow to-danger shadow-[0_0_12px_var(--pink-glow)]"
              />
            </div>
            <div className="mt-2 flex justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <span>calm</span><span className="text-foreground">{Math.round(pressure)}%</span><span>intense</span>
            </div>

            <div className="mt-5 text-[10px] font-mono uppercase tracking-widest text-cyan-glow">// confidence</div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { l: "Voice", v: metrics.voice },
                { l: "Pace", v: metrics.pace },
                { l: "Clarity", v: metrics.clarity }
              ].map((m)=>(
                <div key={m.l} className="rounded-lg glass p-2 text-center">
                  <div className="font-display text-xl gradient-text">{m.v}</div>
                  <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">{m.l}</div>
                </div>
              ))}
            </div>
          </HoloCard>

          <HoloCard>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-danger">
              <AlertTriangle className="h-3 w-3" /> lie detector
            </div>
            <div className="mt-2 text-sm">Resume claims <span className="text-foreground">Python ⭐⭐⭐⭐⭐</span></div>
            <div className="mt-1 text-xs text-muted-foreground">Probing decorators, GIL, generators…</div>
            <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full w-[34%] bg-gradient-to-r from-success to-danger" />
            </div>
            <div className="mt-1 flex justify-between text-[9px] font-mono uppercase tracking-widest">
              <span className="text-success">authentic</span>
              <span className="text-danger">bluff risk · 34%</span>
            </div>
          </HoloCard>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setQi((q) => (q + 1) % QUESTIONS.length)}
          className="inline-flex items-center gap-2 rounded-xl glass px-5 py-2.5 text-sm hover:bg-white/5"
        >
          Next Question <ArrowRight className="h-4 w-4" />
        </button>
        <Link
          to="/report"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-electric to-neon px-6 py-3 font-medium text-background shadow-[var(--glow-electric)]"
        >
          End & Generate Report <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
