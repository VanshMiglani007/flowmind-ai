import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  BrainCircuit, 
  Flame, 
  Compass, 
  AlertCircle, 
  Dna,
  RefreshCw,
  Trash2,
  WifiOff,
  ShieldAlert
} from "lucide-react";
import { 
  mapAIError, 
  pushToOfflineQueue, 
  getLocalFallbackResponse,
  isQuotaError,
  delay
} from "../utils/aiHelper";

interface Message {
  role: "user" | "model";
  text: string;
  timestamp?: number;
}

interface MessageBubbleProps {
  msg: Message;
  isUser: boolean;
  onSpeak: (text: string) => void;
  animateReveal: boolean;
}

function MessageBubble({ msg, isUser, onSpeak, animateReveal }: MessageBubbleProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!animateReveal || isUser) {
      setDisplayedText(msg.text);
      setIsDone(true);
      return;
    }

    const words = msg.text.split(" ");
    let currentWordIndex = 0;
    setDisplayedText("");
    setIsDone(false);

    const interval = setInterval(() => {
      if (currentWordIndex < words.length) {
        setDisplayedText(prev => prev + (prev ? " " : "") + words[currentWordIndex]);
        currentWordIndex++;
      } else {
        clearInterval(interval);
        setIsDone(true);
      }
    }, 28); // 28ms word transition

    return () => clearInterval(interval);
  }, [msg.text, animateReveal, isUser]);

  return (
    <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1 relative group transition-all duration-300 ${
      isUser 
        ? "bg-indigo-500/15 border-indigo-500/30 text-white/90 rounded-tr-none pb-5 hover:border-indigo-500/50" 
        : "bg-[#050507] border border-white/10 text-white/80 rounded-tl-none shadow-md pb-5 hover:border-cyan-500/35"
    }`}>
      <p className="whitespace-pre-line font-sans">{displayedText}</p>
      
      {!isDone && !isUser && (
        <button
          onClick={() => {
            setDisplayedText(msg.text);
            setIsDone(true);
          }}
          className="text-[9px] font-mono text-cyan-400 hover:text-cyan-300 mt-2 uppercase tracking-widest block animate-pulse hover:underline"
        >
          ✦ [Skip Reveal]
        </button>
      )}

      {/* Message timestamp and speak button controls */}
      <div className="absolute left-4 bottom-1.5 flex items-center gap-1.5 opacity-60">
        {msg.timestamp && (
          <span className="text-[9px] font-mono text-white/30">
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Manual trigger voice speak button for model answers */}
      {!isUser && isDone && (
        <button
          onClick={() => onSpeak(msg.text)}
          className="absolute right-2 bottom-2 p-1.5 rounded bg-[#050507] hover:bg-white/10 border border-white/10 text-white/50 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Speak Message"
        >
          <Volume2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

interface AICoachProps {
  onSendMessage: (contents: any[], systemInstruction?: string, onRetry?: (attempt: number, errorMsg: string) => void) => Promise<{ text: string, source: "gemini" | "fallback" }>;
  tasksContext: any;
  habitsContext: any;
  isOnline: boolean;
  quotaExhausted?: boolean;
  quotaCooldownSeconds?: number;
}

export default function AICoach({ onSendMessage, tasksContext, habitsContext, isOnline, quotaExhausted, quotaCooldownSeconds }: AICoachProps) {
  const [aiSource, setAiSource] = useState<"gemini" | "fallback">("gemini");
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem("flowmind_coach_messages");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load chat history from localStorage:", e);
    }
    const getInitialMessage = () => {
      try {
        const savedOnboarding = localStorage.getItem("flowmind_onboarding");
        if (savedOnboarding) {
          const ob = JSON.parse(savedOnboarding);
          if (ob && ob.name) {
            return `Hello ${ob.name}! I'm your AI Coach. As a ${ob.workType || "professional"}, I'm here to help you optimize your focus, align your daily schedules, and conquer ${ob.struggle || "your workload challenges"}. How can I help you plan your day or manage your stress today?`;
          }
        }
      } catch (e) {
        console.error("Failed to parse onboarding for coach message:", e);
      }
      return "Hello! I'm your AI Coach. I've reviewed your active tasks and habits. How can I help you plan your day, optimize your focus, or manage your workload?";
    };

    return [
      { 
        role: "model", 
        text: getInitialMessage(),
        timestamp: Date.now()
      }
    ];
  });
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [chatNotification, setChatNotification] = useState<{ text: string; type: "info" | "success" } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  // Voice States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);

  // Speech Recognition & Synthesis references
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Reliability, Cooldown & Retry states
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [retryStatus, setRetryStatus] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState("Analyzing your workload...");

  // Duplicate prevention guard (StrictMode safe)
  const isExecutingRef = useRef(false);
  const lastSubmittedPromptRef = useRef<string>("");

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setTimeout(() => {
        setCooldownRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownRemaining]);

  // Loading status messages rotating effect
  useEffect(() => {
    let interval: any;
    if (isThinking) {
      const phases = [
        "Analyzing your workload...",
        "Reviewing your focus patterns...",
        "Evaluating task priorities...",
        "Preparing productivity recommendations...",
        "Optimizing your daily schedule..."
      ];
      let step = 0;
      setLoadingStatus(phases[0]);
      interval = setInterval(() => {
        step = (step + 1) % phases.length;
        setLoadingStatus(phases[step]);
      }, 2200);
    } else {
      setLoadingStatus("Analyzing your workload...");
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isThinking]);

  // Synchronization event listener
  useEffect(() => {
    const handleChatSyncEvent = () => {
      try {
        const saved = localStorage.getItem("flowmind_coach_messages");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch (e) {
        console.error("Failed to synchronize chat log on sync event", e);
      }
    };
    window.addEventListener("flowmind_chat_sync", handleChatSyncEvent);
    return () => {
      window.removeEventListener("flowmind_chat_sync", handleChatSyncEvent);
    };
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("flowmind_coach_messages", JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save chat history to localStorage:", e);
    }
  }, [messages]);

  // Initialize Speech Synthesis and Recognition on Mount
  useEffect(() => {
    synthRef.current = window.speechSynthesis;

    // Set up Webkit Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        // Automatically submit transcribed vocal query
        submitVocalMessage(transcript);
      };

      rec.onerror = (err: any) => {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      // Clean speech loops
      synthRef.current?.cancel();
    };
  }, []);

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      setVoiceError("Voice speech recognition is not fully supported in this browser. Please use Chrome or desktop browsers.");
      setTimeout(() => setVoiceError(null), 5000);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      synthRef.current?.cancel(); // Mute old speech
      setIsSpeaking(false);
      recognitionRef.current.start();
    }
  };

  // Speak coach response out loud
  const speakText = (text: string) => {
    if (isVoiceMuted || !synthRef.current) return;
    synthRef.current.cancel(); // Stop old speak

    // Clean markdown characters from text for a smooth reading experience
    const plainText = text.replace(/[\*\_#`\-]/g, " ").slice(0, 300); // Read first 300 chars to avoid infinite voice loops

    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    // Pick a cool voice if available
    const voices = synthRef.current.getVoices();
    const googleVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Natural"));
    if (googleVoice) {
      utterance.voice = googleVoice;
    }
    utterance.rate = 1.05; // Slightly fast, futuristic pace

    synthRef.current.speak(utterance);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isThinking) return;

    if (cooldownRemaining > 0) {
      setChatNotification({ 
        text: `Rate limit active. Please wait ${cooldownRemaining}s before sending another message.`, 
        type: "info" 
      });
      setTimeout(() => setChatNotification(null), 3500);
      return;
    }

    const userMessage = inputText.trim();
    setInputText("");
    
    await executeChatFlow(userMessage);
  };

  const submitVocalMessage = async (text: string) => {
    if (!text.trim() || isThinking) return;
    
    if (cooldownRemaining > 0) {
      setChatNotification({ 
        text: `Rate limit active. Please wait ${cooldownRemaining}s between submissions.`, 
        type: "info" 
      });
      setTimeout(() => setChatNotification(null), 3500);
      return;
    }

    await executeChatFlow(text);
  };

  const executeChatFlow = async (queryText: string) => {
    // Duplicate prevention: block if already executing or same prompt just submitted
    if (isExecutingRef.current) return;
    const trimmedQuery = queryText.trim().slice(0, 2000); // Truncate input to 2000 chars max
    if (!trimmedQuery) return;
    if (lastSubmittedPromptRef.current === trimmedQuery && isThinking) return;

    isExecutingRef.current = true;
    lastSubmittedPromptRef.current = trimmedQuery;

    // Append User Message
    const updatedMessages = [...messages, { role: "user" as const, text: trimmedQuery, timestamp: Date.now() }];
    setMessages(updatedMessages);
    setIsThinking(true);
    setRetryStatus(null);
    synthRef.current?.cancel(); // Stop speaking when user types

    // Prepare compact context (max 3 items each)
    const compactTasks = Array.isArray(tasksContext) ? tasksContext.slice(0, 3) : [];
    const compactHabits = Array.isArray(habitsContext) ? habitsContext.slice(0, 3) : [];

    const systemInstruction = `You are a concise AI Productivity Coach inside FlowMind AI. Help with planning, focus, and stress. Keep answers short, supportive, and actionable with clear bullet points.
Active tasks: ${JSON.stringify(compactTasks)}
Habits: ${JSON.stringify(compactHabits)}`;

    // Truncate to last 4 messages for token reduction
    const recentMessages = updatedMessages.slice(-4);
    const contentsPayload = recentMessages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    // Offline state check
    if (!isOnline) {
      await delay(800);
      pushToOfflineQueue(contentsPayload, systemInstruction);
      
      const offlineAlertText = `[OFFLINE MODE]\n\nYour message has been saved to the offline queue and will sync automatically when your connection is restored.\n\nAI temporarily unavailable. Please retry shortly.`;
      
      setMessages(prev => [...prev, { role: "model" as const, text: offlineAlertText, timestamp: Date.now() }]);
      setAiSource("fallback");
      setIsThinking(false);
      isExecutingRef.current = false;
      return;
    }

    try {
      const response = await onSendMessage(contentsPayload, systemInstruction, (attempt, errorMsg) => {
        if (errorMsg.includes("503") || errorMsg.includes("unavailable")) {
          setRetryStatus(`Google Gemini is temporarily overloaded. Retrying... (Attempt ${attempt} of 1)`);
        } else {
          setRetryStatus(`Connection unresponsive. Retrying... (Attempt ${attempt} of 1)`);
        }
      });

      setMessages(prev => [...prev, { role: "model" as const, text: response.text, timestamp: Date.now() }]);
      setAiSource(response.source);
      setCooldownRemaining(4); // 4 seconds spam cooldown
      speakText(response.text);
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.message || "";
      setAiSource("fallback");
      
      // For quota errors, show clean message without large fallback
      if (isQuotaError(errorMsg)) {
        setMessages(prev => [...prev, { role: "model" as const, text: "AI capacity temporarily exhausted. Please retry in about a minute.", timestamp: Date.now() }]);
      } else {
        const polishedError = mapAIError(errorMsg);
        setMessages(prev => [...prev, { role: "model" as const, text: polishedError, timestamp: Date.now() }]);
      }
    } finally {
      setIsThinking(false);
      setRetryStatus(null);
      isExecutingRef.current = false;
    }
  };

  const handleClearChat = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => {
        setConfirmClear(false);
      }, 3000);
      return;
    }

    setConfirmClear(false);
    const defaultMsg: Message = {
      role: "model",
      text: "Conversation history cleared. AI Productivity Coach is ready. How can I help you focus today?",
      timestamp: Date.now()
    };
    setMessages([defaultMsg]);
    synthRef.current?.cancel();
    setIsSpeaking(false);

    setChatNotification({ text: "Conversation history cleared successfully!", type: "success" });
    setTimeout(() => setChatNotification(null), 4000);
  };

  // Prompt helper templates
  const adviceTemplates = [
    { title: "Defeat Procrastination", icon: Flame, prompt: "Procrastination is slowing me down. Help me create a 3-step action plan based on my high-priority tasks." },
    { title: "Manage Stress", icon: Compass, prompt: "I am feeling stressed and overwhelmed today. Review my tasks and suggest which ones to postpone, and recommend some stress-relief habits." },
    { title: "Optimize Focus", icon: BrainCircuit, prompt: "Help me create an optimized schedule outline for my current development tasks with balanced rest breaks." },
    { title: "Weekly Motivation", icon: Sparkles, prompt: "Review my habits and tasks, and give me a supportive pep talk to help me lock in my focus for the week." }
  ];

  return (
    <div id="flowmind-ai-coach-workspace" className="flex-1 p-8 overflow-y-auto bg-[#050507] relative select-none flex flex-col xl:flex-row gap-8">
      {/* LEFT COLUMN: INTERACTIVE PULSE ORB & ADVICE CARDS */}
      <div className="xl:w-96 flex-shrink-0 flex flex-col justify-between gap-6">
        
        {/* Futursitic breathing AI Neural Orb */}
        <div className="bg-[#0c0c0e] border border-white/10 p-6 rounded-3xl text-center space-y-4 backdrop-blur-md relative overflow-hidden flex flex-col items-center justify-center py-8">
          {/* Glowing underlying radial wave */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5" />

          {/* Core pulsing Orb canvas */}
          <div className="relative w-40 h-40 flex items-center justify-center mb-2">
            {/* Pulsing ring 1 */}
            <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 opacity-20 blur-md transition-all duration-700 ${
              isThinking ? "animate-spin scale-110" : isSpeaking ? "animate-pulse scale-105" : "scale-100"
            }`} style={{ animationDuration: isThinking ? '2s' : '4s' }} />

            {/* Pulsing ring 2 */}
            <div className={`absolute w-32 h-32 rounded-full border border-cyan-400/30 flex items-center justify-center transition-all ${
              isListening ? "border-rose-400/60 scale-105 animate-ping" : "animate-pulse"
            }`} style={{ animationDuration: '3s' }} />

            {/* Core Neural Node dot */}
            <div className={`w-24 h-24 rounded-full bg-[#050507] border-2 flex flex-col items-center justify-center relative z-10 transition-all ${
              isListening ? "border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)]" : "border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
            }`}>
              <Dna className={`w-10 h-10 ${
                isListening ? "text-rose-400 animate-pulse" : "text-cyan-400 animate-spin"
              }`} style={{ animationDuration: isListening ? '1s' : '15s' }} />
              <span className="text-[8px] font-mono font-black mt-1 uppercase text-white/40">
                {isThinking ? "THINKING" : isListening ? "LISTENING" : isSpeaking ? "SPEAKING" : "STANDBY"}
              </span>
            </div>
          </div>

          <h3 className="text-base font-bold text-white tracking-wide relative z-10">AI Productivity Coach</h3>
          <p className="text-xs text-white/40 leading-normal max-w-xs mx-auto relative z-10">
            Select a preset query below to analyze your schedule, manage stress, or design a focus plan.
          </p>
        </div>

        {/* Smart Advice Command Templates */}
        <div className="space-y-3.5">
          <h4 className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest pl-1">Quick Actions</h4>
          
          <div className="grid grid-cols-1 gap-3">
            {adviceTemplates.map((template, idx) => {
              const Icon = template.icon;
              return (
                <button
                  key={idx}
                  id={`advice-template-${idx}`}
                  onClick={() => executeChatFlow(template.prompt)}
                  disabled={isThinking}
                  className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 p-3.5 rounded-2xl flex items-start gap-3.5 transition-all group disabled:opacity-50"
                >
                  <div className="p-2 bg-[#050507] border border-white/10 rounded-xl text-white/50 group-hover:text-cyan-400 group-hover:border-cyan-500/25 transition-all">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">{template.title}</h5>
                    <p className="text-[10.5px] text-white/40 leading-snug mt-0.5 line-clamp-1">{template.prompt}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: CHAT WINDOW CONVERSATION */}
      <div className="flex-1 bg-[#0c0c0e] border border-white/10 rounded-3xl backdrop-blur-md flex flex-col overflow-hidden h-[600px] xl:h-auto">
        
        {/* Chat Header controls */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-white">AI Coach</h3>
              <div className="flex items-center gap-1.5 mt-0.5 animate-fade-in">
                <span className={`text-[10px] font-mono flex items-center gap-1 ${aiSource === "gemini" ? "text-green-400" : "text-amber-400 animate-pulse"}`}>
                  <span>●</span> {aiSource === "gemini" ? "Gemini Live" : "Assist Mode"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Clear Chat Memory */}
            <button
              onClick={handleClearChat}
              className={`px-3 py-2 rounded-xl border text-[10px] font-mono font-bold transition-all flex items-center gap-1.5 ${
                confirmClear 
                  ? "border-rose-500/40 bg-rose-500/10 text-rose-400 animate-pulse" 
                  : "border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              }`}
              title={confirmClear ? "Click again to confirm clear" : "Clear conversation history"}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {confirmClear ? "Confirm Clear?" : "Clear Chat"}
            </button>

            {/* Voice Mute / Unmute */}
            <button
              onClick={() => {
                setIsVoiceMuted(!isVoiceMuted);
                synthRef.current?.cancel();
                setIsSpeaking(false);
              }}
              className={`p-2 rounded-xl border transition-all ${
                isVoiceMuted 
                  ? "border-white/10 bg-white/5 text-white/40 hover:text-white hover:bg-white/10" 
                  : "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
              }`}
              title={isVoiceMuted ? "Enable Voice Assistant Output" : "Mute Voice Assistant Output"}
            >
              {isVoiceMuted ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        {/* Inline voice unsupported warning notification */}
        {voiceError && (
          <div className="p-3 mx-4 mt-4 bg-amber-400/10 border border-amber-400/30 rounded-xl text-xs text-amber-300 font-sans">
            {voiceError}
          </div>
        )}

        {/* Dynamic chat persistence notifications */}
        {chatNotification && (
          <div className={`p-3 mx-4 mt-4 rounded-xl text-xs font-sans border transition-all ${
            chatNotification.type === "success" 
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
          }`}>
            {chatNotification.text}
          </div>
        )}

        {/* Chat scrolling board */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-850">
          
          {/* Quota Exhaustion Banner */}
          {quotaExhausted && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-200 flex items-center gap-3 animate-pulse">
              <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="font-bold font-mono uppercase tracking-wide text-amber-300">AI Capacity Exhausted</p>
                <p className="mt-0.5">Please retry in about {quotaCooldownSeconds || 60} seconds. Your chat history is preserved.</p>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <div 
                key={idx} 
                className={`flex gap-3.5 items-start max-w-[85%] ${
                  isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar */}
                <div className={`w-8.5 h-8.5 rounded-xl border flex items-center justify-center font-mono text-xs font-bold flex-shrink-0 ${
                  isUser 
                    ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" 
                    : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                }`}>
                  {isUser ? "You" : "AI"}
                </div>

                {/* Message Box with typing reveal animation support */}
                <MessageBubble 
                  msg={msg} 
                  isUser={isUser} 
                  onSpeak={speakText} 
                  animateReveal={idx === messages.length - 1 && !isUser} 
                />
              </div>
            );
          })}

          {/* Thinking loading block */}
          {isThinking && (
            <div className="flex flex-col gap-2.5 max-w-[85%] mr-auto">
              <div className="flex gap-3.5 items-start">
                <div className="w-8.5 h-8.5 rounded-xl border bg-cyan-500/10 border-cyan-500/30 text-cyan-400 flex items-center justify-center font-mono text-xs font-bold flex-shrink-0 shadow-[0_0_15px_rgba(34,211,238,0.2)] animate-pulse">
                  AI
                </div>
                <div className="bg-[#050507] border border-cyan-500/30 p-4 rounded-2xl rounded-tl-none text-xs text-white/80 flex items-center gap-2.5 relative overflow-hidden shadow-lg min-w-[240px]">
                  {/* Scanline pulse effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-cyan-500/5 animate-pulse" />
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400 flex-shrink-0" />
                  <span className="font-mono tracking-wide">{loadingStatus}</span>
                </div>
              </div>
              
              {retryStatus && (
                <div className="ml-12 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 font-mono flex items-center gap-2 animate-pulse shadow-md">
                  <ShieldAlert className="w-4.5 h-4.5 text-amber-400 animate-bounce flex-shrink-0" />
                  <span>{retryStatus}</span>
                </div>
              )}
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input box forms */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-white/5 flex items-center gap-3">
          {/* Voice Speech Recognition Trigger */}
          <button
            type="button"
            id="coach-btn-voice-mic"
            onClick={handleToggleListening}
            className={`p-3 rounded-xl border flex-shrink-0 transition-all ${
              isListening
                ? "bg-rose-500 border-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                : "bg-white/5 border border-white/10 text-white/60 hover:text-white"
            }`}
            title={isListening ? "Deactivate Voice Input" : "Start Voice Input"}
          >
            {isListening ? <MicOff className="w-4.5 h-4.5 animate-pulse" /> : <Mic className="w-4.5 h-4.5" />}
          </button>

          <input
            type="text"
            placeholder={isListening ? "Listening..." : "Ask your AI Coach a question..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isThinking || isListening}
            className="flex-1 bg-[#050507] border border-white/10 focus:border-cyan-500/50 rounded-xl px-4 py-3 text-xs text-white focus:outline-none placeholder-white/30"
          />

          <button
            type="submit"
            id="coach-btn-submit"
            disabled={!inputText.trim() || isThinking || isListening || quotaExhausted}
            className="p-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold flex items-center justify-center hover:opacity-95 shadow-[0_0_12px_rgba(34,211,238,0.15)] disabled:opacity-50"
          >
            <Send className="w-4.5 h-4.5 stroke-[2.5]" />
          </button>
        </form>

      </div>
    </div>
  );
}
