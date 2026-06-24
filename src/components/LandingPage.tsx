import React, { useState } from "react";
import { 
  Sparkles, 
  Brain, 
  Clock, 
  Activity, 
  Flame, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight, 
  Compass, 
  ChevronRight,
  Target,
  ListTodo,
  User,
  Cpu,
  GraduationCap,
  Laptop,
  Briefcase,
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LandingPageProps {
  onEnterWorkspace: (onboardingData: OnboardingData) => void;
  onLoadDemoWorkspace: () => void;
  hasWorkspace?: boolean;
  onReturnToWorkspace?: () => void;
  isDemoActive?: boolean;
}

export interface OnboardingData {
  name: string;
  workType: string;
  struggle: string;
  workHoursStart: string;
  workHoursEnd: string;
}

export default function LandingPage({ 
  onEnterWorkspace, 
  onLoadDemoWorkspace,
  hasWorkspace = false,
  onReturnToWorkspace,
  isDemoActive = false
}: LandingPageProps) {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isEntering, setIsEntering] = useState(false);

  // Onboarding Form States
  const [name, setName] = useState("");
  const [workType, setWorkType] = useState("Developer");
  const [struggle, setStruggle] = useState("Procrastination");
  const [workHoursStart, setWorkHoursStart] = useState("09:00");
  const [workHoursEnd, setWorkHoursEnd] = useState("17:00");

  const [formError, setFormError] = useState("");

  const handleNextStep = () => {
    if (step === 1) {
      if (!name.trim()) {
        setFormError("Please tell us your name.");
        return;
      }
      setFormError("");
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmitOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Please enter your name.");
      setStep(1);
      return;
    }
    setIsEntering(true);
    setTimeout(() => {
      onEnterWorkspace({
        name: name.trim(),
        workType,
        struggle,
        workHoursStart,
        workHoursEnd
      });
    }, 1500);
  };

  const handleDemoClick = () => {
    setIsEntering(true);
    setTimeout(() => {
      onLoadDemoWorkspace();
    }, 1500);
  };

  const scrollToFeatures = () => {
    const el = document.getElementById("features");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const features = [
    {
      icon: Target,
      title: "AI Task Prioritization",
      description: "Gemini AI analyzes deadline risk, delay histories, and current energy levels to prioritize tasks.",
      color: "from-cyan-400/20 to-blue-500/10 text-cyan-400 border-cyan-500/20"
    },
    {
      icon: Clock,
      title: "Smart Daily Scheduling",
      description: "Automatically block work, break, routine, and buffer time tailored to your preferred productive hours.",
      color: "from-indigo-500/20 to-purple-500/10 text-indigo-400 border-indigo-500/20"
    },
    {
      icon: Flame,
      title: "Focus Timer & Ambient Synth",
      description: "Log focus sessions with built-in pink noise, deep space, or warm synth drones to block distractions.",
      color: "from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/20"
    },
    {
      icon: Brain,
      title: "AI Productivity Coach",
      description: "Brainstorm daily objectives, overcome friction points, and ask for stress-mitigating planning advice.",
      color: "from-violet-500/20 to-purple-500/10 text-violet-400 border-violet-500/20"
    },
    {
      icon: Activity,
      title: "Habit & Streak Tracking",
      description: "Visual 7-day progress loops designed to gamify habit streaks and reward consistency with XP multipliers.",
      color: "from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/20"
    },
    {
      icon: ShieldCheck,
      title: "Burnout Risk Detection",
      description: "Algorithmic assessment flags overloaded schedules and inserts stress recovery slots before exhaustion strikes.",
      color: "from-rose-500/20 to-red-500/10 text-rose-400 border-rose-500/20"
    },
    {
      icon: Cpu,
      title: "Offline Persistence",
      description: "Seamless synchronization locks state changes locally and buffers server-side requests during network offline periods.",
      color: "from-blue-500/20 to-cyan-500/10 text-blue-400 border-blue-500/20"
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description: "Review comprehensive metrics covering daily completion ratios, focus duration tracking, and behavioral biometrics.",
      color: "from-teal-500/20 to-emerald-500/10 text-teal-400 border-teal-500/20"
    }
  ];

  const workTypes = [
    { id: "Student", label: "Student", icon: GraduationCap, desc: "Academics, assignments, exam preparation" },
    { id: "Developer", label: "Developer", icon: Laptop, desc: "Sprints, engineering tasks, system design" },
    { id: "Freelancer", label: "Freelancer", icon: Compass, desc: "Multiple client projects, self-scheduling" },
    { id: "Professional", label: "Professional", icon: Briefcase, desc: "Strategic plans, corporate timelines, meetings" }
  ];

  const struggles = [
    { id: "Procrastination", label: "Overcoming Procrastination", desc: "Starting tasks on time and breaking friction loops" },
    { id: "Burnout & Stress", label: "Burnout & Overwhelm", desc: "Managing workload fatigue and chronic stress indicators" },
    { id: "Daily Planning", label: "Disorganized Scheduling", desc: "Allocating chronological blocks to structure the day" },
    { id: "Focus & Distraction", label: "Focus & Interruptions", desc: "Maintaining deep work durations without distraction noise" }
  ];

  return (
    <div className="w-full min-h-screen bg-[#050507] text-white/95 overflow-x-hidden font-sans selection:bg-cyan-500/20 selection:text-cyan-300 relative scroll-smooth">
      
      {/* Dynamic Animated Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[15%] w-[45%] h-[400px] rounded-full bg-cyan-500/10 blur-[130px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] right-[10%] w-[35%] h-[350px] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute top-[-5%] right-[25%] w-[25%] h-[200px] rounded-full bg-purple-500/5 blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
      </div>

      {/* Grid Pattern overlay for tech-forward feel */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* HEADER NAVBAR */}
      <header className="relative max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-cyan-300/20">
            <Sparkles className="w-4.5 h-4.5 text-black stroke-[2.5]" />
          </div>
          <span className="text-md font-bold tracking-tight text-white flex items-center gap-1">
            FlowMind <span className="text-[10px] uppercase tracking-wider bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-white/50">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          {isDemoActive ? (
            <div className="px-3 py-2 text-xs font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center gap-1.5 font-mono select-none animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Demo Active
            </div>
          ) : (
            <button
              onClick={handleDemoClick}
              className="px-4 py-2 text-xs font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all font-mono cursor-pointer"
            >
              Load Demo Workspace
            </button>
          )}
          {hasWorkspace ? (
            <button
              onClick={onReturnToWorkspace}
              className="px-4 py-2 text-xs font-bold bg-white text-black hover:bg-white/90 rounded-xl transition-all flex items-center gap-1 shadow-lg cursor-pointer"
            >
              Return to Workspace <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="px-4 py-2 text-xs font-bold bg-white text-black hover:bg-white/90 rounded-xl transition-all flex items-center gap-1 shadow-lg cursor-pointer"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative max-w-4xl mx-auto text-center px-6 pt-20 pb-24 z-10 space-y-8 flex flex-col items-center">
        {/* Animated Pill indicator */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/5 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-wide shadow-inner"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Intelligent daily scheduling, calibrated for cognitive energy</span>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="space-y-4"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1] max-w-3xl mx-auto">
            Plan smarter.<br />
            Focus better. <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">Finish on time.</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-white/65 max-w-2xl mx-auto font-sans leading-relaxed pt-2">
            FlowMind AI helps students and professionals organize tasks, reduce procrastination, manage burnout, and generate intelligent daily schedules powered by Gemini AI.
          </p>
        </motion.div>

        {/* CTA Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md pt-4"
        >
          {hasWorkspace ? (
            <button
              onClick={onReturnToWorkspace}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:shadow-[0_0_25px_rgba(34,211,238,0.3)] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 border border-white/10 group cursor-pointer"
            >
              Return to Workspace <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:shadow-[0_0_25px_rgba(34,211,238,0.3)] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 border border-white/10 group cursor-pointer"
            >
              Enter Workspace <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
          
          {isDemoActive ? (
            <div className="w-full sm:w-auto px-8 py-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-cyan-400 font-semibold text-sm flex items-center justify-center gap-2 font-mono select-none">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Demo Workspace Active
            </div>
          ) : (
            <button
              onClick={scrollToFeatures}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#0c0c0e] border border-white/10 hover:bg-white/5 text-white/90 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              View Features
            </button>
          )}
        </motion.div>

        {/* Trust features row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full pt-12"
        >
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-y-6 gap-x-4 max-w-5xl mx-auto text-xs text-white/50 font-mono tracking-wider uppercase font-bold text-center">
            <div className="flex flex-col items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400/80 mb-1" />
              <span>AI-Powered Planning</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400/80 mb-1" />
              <span>Smart Focus Sessions</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Activity className="w-5 h-5 text-rose-400/80 mb-1" />
              <span>Burnout Prevention</span>
            </div>
            <div className="flex flex-col items-center gap-2 font-black">
              <Flame className="w-5 h-5 text-amber-500/80 mb-1" />
              <span>Habit Tracking</span>
            </div>
            <div className="col-span-2 sm:col-span-1 flex flex-col items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400/80 mb-1 animate-pulse" />
              <span>Gemini AI Native</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FEATURE SHOWCASE SECTION */}
      <section id="features" className="relative max-w-7xl mx-auto px-6 py-20 z-10 space-y-16 border-t border-white/5 bg-[#050507]">
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Designed to optimize your cognitive alignment
          </h2>
          <p className="text-xs sm:text-sm text-white/50 max-w-md mx-auto leading-relaxed">
            FlowMind combines advanced task analytics and stress monitoring metrics to engineer your ideal productive routine.
          </p>
        </div>

        {/* Features Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -6, scale: 1.01 }}
                className="bg-[#0c0c0e] border border-white/10 p-6 rounded-2xl flex flex-col justify-between space-y-5 group hover:border-white/20 transition-all duration-300 relative overflow-hidden"
              >
                {/* Accent glow on hover */}
                <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full bg-gradient-to-br ${feature.color} blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                <div className="space-y-4 relative z-10">
                  <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${feature.color.split(" ")[2]} group-hover:bg-white/10 transition-colors`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide">{feature.title}</h3>
                    <p className="text-xs text-white/50 leading-relaxed mt-2">{feature.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/40 uppercase font-black select-none pt-2 relative z-10">
                  <span>Engine Feature</span> <ChevronRight className="w-3 h-3 text-cyan-400" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative border-t border-white/5 py-12 bg-[#08080a] text-center text-xs text-white/30 z-10 space-y-3">
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 text-black" />
          </div>
          <span className="font-bold text-white/60">FlowMind AI</span>
        </div>
        <p className="max-w-md mx-auto leading-relaxed">
          Crafted for high-performance cognitive day planning. Integrates securely with local and cloud persistent databases.
        </p>
        <p className="font-mono text-[10px] text-white/20">© 2026 FlowMind Systems. All biometrics secured.</p>
      </footer>

      {/* LIGHTWEIGHT ONBOARDING MODAL OVERLAY */}
      <AnimatePresence>
        {isOnboardingOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-[#0c0c0e] border border-white/15 p-6 sm:p-8 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
              {/* Soft glow inside modal */}
              <div className="absolute top-[-30%] right-[-30%] w-[60%] h-[60%] bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none" />

              {/* Progress Steps Indicators */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                    <Brain className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <span className="text-xs font-bold text-white">Configure Your Flow</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/40 uppercase font-bold">
                  <span className={step === 1 ? "text-cyan-400 font-bold" : ""}>Name</span>
                  <span>•</span>
                  <span className={step === 2 ? "text-cyan-400 font-bold" : ""}>Work</span>
                  <span>•</span>
                  <span className={step === 3 ? "text-cyan-400 font-bold" : ""}>Struggle</span>
                  <span>•</span>
                  <span className={step === 4 ? "text-cyan-400 font-bold" : ""}>Hours</span>
                </div>
              </div>

              {/* STEP 1: NAME */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-bold text-white tracking-tight">Let's start with your name.</h2>
                    <p className="text-xs text-white/50 leading-relaxed">
                      Your AI coach and workspace greetings will be tailored specifically to you.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-white/40 font-bold">First Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. Vansh"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (formError) setFormError("");
                        }}
                        required
                        className="w-full bg-[#050507] border border-white/15 focus:border-cyan-500/50 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 focus:outline-none placeholder-white/20 transition-colors"
                      />
                    </div>
                    {formError && (
                      <p className="text-xs text-rose-400 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {formError}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleNextStep}
                      className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs flex items-center gap-1 hover:bg-white/90 transition-all"
                    >
                      Continue <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: WORK TYPE */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-bold text-white tracking-tight">What describes your daily work?</h2>
                    <p className="text-xs text-white/50 leading-relaxed">
                      We calibrate planning models and backlog workloads based on your primary activities.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {workTypes.map((type) => {
                      const WorkIcon = type.icon;
                      const isSelected = workType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setWorkType(type.id)}
                          className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                            isSelected
                              ? "bg-cyan-500/10 border-cyan-500/45 text-white scale-[1.01] shadow-[0_0_15px_rgba(34,211,238,0.1)]"
                              : "bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:bg-white/10"
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${isSelected ? "bg-cyan-400 text-black shadow-md" : "bg-white/5 border border-white/5"} flex-shrink-0`}>
                            <WorkIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white">{type.label}</h4>
                            <p className="text-[10px] text-white/40 leading-normal mt-1">{type.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between pt-4 border-t border-white/5">
                    <button
                      onClick={handlePrevStep}
                      className="px-4 py-2.5 rounded-xl text-white/60 hover:text-white bg-white/5 hover:bg-white/10 text-xs font-semibold"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs flex items-center gap-1 hover:bg-white/90 transition-all"
                    >
                      Continue <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: STRUGGLE */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-bold text-white tracking-tight">What is your main productivity friction?</h2>
                    <p className="text-xs text-white/50 leading-relaxed">
                      Your AI diagnostic recommendations and performance evaluations will center on solving this issue.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 pt-1">
                    {struggles.map((stg) => {
                      const isSelected = struggle === stg.id;
                      return (
                        <button
                          key={stg.id}
                          type="button"
                          onClick={() => setStruggle(stg.id)}
                          className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                            isSelected
                              ? "bg-cyan-500/10 border-cyan-500/45 text-white shadow-[0_0_15px_rgba(34,211,238,0.1)]"
                              : "bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:bg-white/10"
                          }`}
                        >
                          <div>
                            <h4 className="text-xs font-bold text-white">{stg.label}</h4>
                            <p className="text-[10px] text-white/40 leading-normal mt-0.5">{stg.desc}</p>
                          </div>
                          {isSelected && (
                            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between pt-4 border-t border-white/5">
                    <button
                      onClick={handlePrevStep}
                      className="px-4 py-2.5 rounded-xl text-white/60 hover:text-white bg-white/5 hover:bg-white/10 text-xs font-semibold"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs flex items-center gap-1 hover:bg-white/90 transition-all"
                    >
                      Continue <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: PREFERRED WORK HOURS */}
              {step === 4 && (
                <form onSubmit={handleSubmitOnboarding} className="space-y-5">
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-bold text-white tracking-tight">Define your preferred work hours.</h2>
                    <p className="text-xs text-white/50 leading-relaxed">
                      AI day schedules and time-blocking limits will adapt chronologically to this timeline boundary.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-[#050507] p-5 rounded-2xl border border-white/5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-white/40 font-bold">Start Time</label>
                      <input
                        type="time"
                        value={workHoursStart}
                        onChange={(e) => setWorkHoursStart(e.target.value)}
                        required
                        className="w-full bg-[#0c0c0e] border border-white/10 focus:border-cyan-500/50 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-white/40 font-bold">End Time</label>
                      <input
                        type="time"
                        value={workHoursEnd}
                        onChange={(e) => setWorkHoursEnd(e.target.value)}
                        required
                        className="w-full bg-[#0c0c0e] border border-white/10 focus:border-cyan-500/50 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-4 py-2.5 rounded-xl text-white/60 hover:text-white bg-white/5 hover:bg-white/10 text-xs font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-white font-bold text-xs hover:shadow-[0_0_15px_rgba(34,211,238,0.25)] transition-all flex items-center gap-1.5"
                    >
                      Align & Enter Workspace <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}

              {/* Close button */}
              <button
                onClick={() => setIsOnboardingOpen(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors text-xs font-bold"
              >
                ✕
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL SCREEN ENTERING LOADER TRANSITION OVERLAY */}
      <AnimatePresence>
        {isEntering && (
          <div className="fixed inset-0 bg-[#050507] z-[100] flex flex-col items-center justify-center space-y-6 animate-fade-in select-none">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] border border-cyan-300/20 animate-spin">
              <Sparkles className="w-6 h-6 text-black stroke-[2.5]" style={{ animationDuration: '3s' }} />
            </div>
            
            <div className="space-y-1.5 text-center">
              <h2 className="text-md font-bold tracking-widest uppercase font-mono text-cyan-400 animate-pulse">
                Entering Synaptic Workstage...
              </h2>
              <p className="text-xs text-white/40 font-mono">
                Pacing cognitive grids. Aligning database synchronization.
              </p>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
