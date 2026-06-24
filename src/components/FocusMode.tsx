import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Zap, 
  Flame, 
  Settings as SettingsIcon,
  ShieldAlert,
  Sliders
} from "lucide-react";

interface FocusModeProps {
  pomoDuration: number; // minutes
  shortBreakDuration: number; // minutes
  onAddXp: (amount: number) => void;
  onLogFocusSession: (minutes: number) => void;
}

export default function FocusMode({
  pomoDuration,
  shortBreakDuration,
  onAddXp,
  onLogFocusSession
}: FocusModeProps) {
  // Timer States
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [timeLeft, setTimeLeft] = useState(pomoDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [focusMessage, setFocusMessage] = useState<string | null>(null);

  // Sound Synth States
  const [ambientSound, setAmbientSound] = useState<"off" | "rain" | "space" | "grid">("off");
  
  // Audio Context ref
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<{ source: AudioScheduledSourceNode | ScriptProcessorNode; filter?: BiquadFilterNode; gain: GainNode } | null>(null);

  // Sync duration changes from settings
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(mode === "focus" ? pomoDuration * 60 : shortBreakDuration * 60);
    }
  }, [pomoDuration, shortBreakDuration, mode]);

  // Main countdown timer ticker
  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  // Complete session handler
  const handleSessionComplete = () => {
    setIsRunning(false);
    triggerBeepSound();

    if (mode === "focus") {
      onAddXp(50);
      onLogFocusSession(pomoDuration);
      setSessionsCompleted((prev) => prev + 1);
      setFocusMessage("Focus session complete! You earned +50 XP!");
      setMode("break");
      setTimeLeft(shortBreakDuration * 60);
    } else {
      setFocusMessage("Break finished. Ready to focus?");
      setMode("focus");
      setTimeLeft(pomoDuration * 60);
    }

    // Auto-clear message after 6 seconds
    setTimeout(() => {
      setFocusMessage(null);
    }, 6000);
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(mode === "focus" ? pomoDuration * 60 : shortBreakDuration * 60);
  };

  // Synthesize notification beep via Web Audio API
  const triggerBeepSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("AudioContext block:", e);
    }
  };

  // Web Audio Noise Generators for Ambient sound loop
  const startAmbientSynth = (soundType: "rain" | "space" | "grid") => {
    // Clean old nodes first
    stopAmbientSynth();

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.connect(ctx.destination);

      if (soundType === "rain") {
        // Generate pink-like white noise filter for rain
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 0.11; // rescale
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gain);
        whiteNoise.start();

        audioNodesRef.current = { source: whiteNoise, filter, gain };

      } else if (soundType === "space") {
        // Deep low frequency hum drone for cosmic feel
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(55, ctx.currentTime); // Low A

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(100, ctx.currentTime);

        // Subtly modulate volume
        const modulator = ctx.createOscillator();
        const modGain = ctx.createGain();
        modulator.frequency.setValueAtTime(0.15, ctx.currentTime); // slow pulse
        modGain.gain.setValueAtTime(20, ctx.currentTime);
        
        modulator.connect(modGain);
        modGain.connect(filter.frequency); // modulate lowpass cutoff

        osc.connect(filter);
        filter.connect(gain);

        modulator.start();
        osc.start();

        audioNodesRef.current = { source: osc, filter, gain };

      } else if (soundType === "grid") {
        // Synthesizer square low-passed drone
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(110, ctx.currentTime); // A2

        filter.type = "bandpass";
        filter.frequency.setValueAtTime(220, ctx.currentTime);
        filter.Q.setValueAtTime(4, ctx.currentTime);

        osc.connect(filter);
        filter.connect(gain);
        osc.start();

        audioNodesRef.current = { source: osc, filter, gain };
      }

    } catch (err) {
      console.warn("Could not start ambient synthesizer:", err);
    }
  };

  const stopAmbientSynth = () => {
    if (audioNodesRef.current) {
      try {
        audioNodesRef.current.source.stop();
      } catch (e) {}
      audioNodesRef.current = null;
    }
  };

  const handleAmbientChange = (sound: "off" | "rain" | "space" | "grid") => {
    setAmbientSound(sound);
    if (sound === "off") {
      stopAmbientSynth();
    } else {
      startAmbientSynth(sound);
    }
  };

  // Clean ambient audio on unmount
  useEffect(() => {
    return () => {
      stopAmbientSynth();
    };
  }, []);

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Progress metrics calculation for visual ring
  const totalDuration = mode === "focus" ? pomoDuration * 60 : shortBreakDuration * 60;
  const elapsed = totalDuration - timeLeft;
  const progressPercentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

  return (
    <div id="flowmind-focus-workspace" className="flex-1 p-8 overflow-y-auto bg-[#050507] relative select-none flex flex-col justify-center items-center">
      {/* Main minimal centering card */}
      <div className="max-w-xl w-full bg-[#0c0c0e] border border-white/10 p-8 rounded-3xl backdrop-blur-md relative text-center space-y-8 shadow-2xl">
        
        {/* Futuristic Onboarding node indicator */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[10px] font-mono uppercase text-white/40 font-bold">Focus Timer</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 font-black">Reward: +50 XP/Session</span>
        </div>

        {/* Dynamic Notification banner instead of alert dialog */}
        {focusMessage && (
          <div className="p-3 bg-cyan-400/10 border border-cyan-400/30 rounded-xl text-xs text-cyan-300 font-sans tracking-wide animate-bounce">
            {focusMessage}
          </div>
        )}

        {/* Timer main counter */}
        <div className="flex flex-col items-center justify-center relative py-6">
          
          {/* Futuristic SVG Ring */}
          <div className="relative w-72 h-72 flex items-center justify-center">
            
            {/* Ambient Background Circular Track */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-95">
              <circle
                cx="144"
                cy="144"
                r="120"
                stroke="#ffffff"
                strokeWidth="6"
                fill="transparent"
                className="opacity-10"
              />
              
              {/* Active animated gradient ring */}
              <circle
                cx="144"
                cy="144"
                r="120"
                stroke="url(#timerGradient)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={754} // 2 * pi * r
                strokeDashoffset={754 - (754 * progressPercentage) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Centered Numbers */}
            <div className="relative z-10 space-y-1">
              <h2 className="text-6xl font-black text-white tracking-tight font-mono select-all animate-pulse" style={{ animationDuration: isRunning ? '2s' : '0s' }}>
                {formatTime(timeLeft)}
              </h2>
              <p className="text-xs font-mono uppercase font-black tracking-widest text-white/40">
                {mode === "focus" ? "Focus Session" : "Break"}
              </p>
            </div>
          </div>
        </div>

        {/* Timer Control Nodes */}
        <div className="flex items-center justify-center gap-4">
          <button
            id="focus-btn-reset"
            onClick={handleReset}
            className="p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all scale-95 hover:scale-100"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            id="focus-btn-play-pause"
            onClick={handleStartPause}
            className={`p-6 rounded-full transition-all scale-105 hover:scale-110 shadow-lg ${
              isRunning
                ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20"
                : "bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black shadow-cyan-400/25"
            }`}
            title={isRunning ? "Pause Timer" : "Start Timer"}
          >
            {isRunning ? <Pause className="w-6 h-6 stroke-[3]" /> : <Play className="w-6 h-6 stroke-[3]" />}
          </button>

          <button
            id="focus-btn-ambient-list"
            className="p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all scale-95 hover:scale-100"
            title="Settings"
          >
            <Sliders className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Dynamic Sound Synthesizer Controls */}
        <div className="bg-[#050507] border border-white/10 p-4 rounded-2xl space-y-3">
          <div className="flex justify-between items-center text-xs text-white/40 font-mono">
            <span>Ambient Sound</span>
            <span className="flex items-center gap-1 text-[10px] text-cyan-400">
              <Volume2 className="w-3.5 h-3.5" /> Audio Active
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {[
              { id: "off", label: "Mute" },
              { id: "rain", label: "Rain" },
              { id: "space", label: "Deep Space" },
              { id: "grid", label: "Warm Noise" }
            ].map((sound) => {
              const isSelected = ambientSound === sound.id;
              return (
                <button
                  key={sound.id}
                  id={`focus-ambient-sound-${sound.id}`}
                  onClick={() => handleAmbientChange(sound.id as any)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                    isSelected
                      ? "bg-white/10 border-cyan-500/40 text-cyan-400 shadow-md"
                      : "bg-transparent border-white/10 hover:border-white/20 text-white/50 hover:text-white"
                  }`}
                >
                  {sound.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Session Stats */}
        <div className="border-t border-white/10 pt-5 grid grid-cols-2 gap-4 text-xs font-mono text-white/40">
          <div className="p-3 bg-[#050507] border border-white/10 rounded-2xl">
            <span className="block text-[10px] text-white/40 uppercase font-black">Sessions Logged</span>
            <strong className="text-lg text-white font-black">{sessionsCompleted} Sessions</strong>
          </div>

          <div className="p-3 bg-[#050507] border border-white/10 rounded-2xl">
            <span className="block text-[10px] text-white/40 uppercase font-black">Focus Points Earned</span>
            <strong className="text-lg text-cyan-400 font-black">+{sessionsCompleted * 50} XP</strong>
          </div>
        </div>

      </div>
    </div>
  );
}
