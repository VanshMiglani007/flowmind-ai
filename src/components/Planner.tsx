import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  LayoutGrid,
  Plus,
  Compass,
  ArrowRight,
  ShieldAlert,
  BrainCircuit,
  Activity,
  Zap,
  Gauge,
  Check,
  ChevronRight,
  HelpCircle,
  ThumbsUp,
  Sliders,
  TrendingUp
} from "lucide-react";
import { Task, ScheduleBlock, Mood, DayPlan } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface PlannerProps {
  tasks: Task[];
  scheduleBlocks: ScheduleBlock[];
  mood: Mood;
  setMood: (mood: Mood) => void;
  workHoursStart: string;
  workHoursEnd: string;
  onGenerateAIPlan: (breakPref: string, stress: string, focusCons: string) => Promise<void>;
  isGeneratingPlan: boolean;
  onUpdateScheduleBlocks: (blocks: ScheduleBlock[]) => void;
  onMoveIncompleteTasks: () => void;
  currentDayPlan: DayPlan | null;
}

export default function Planner({
  tasks,
  scheduleBlocks,
  mood,
  setMood,
  workHoursStart,
  workHoursEnd,
  onGenerateAIPlan,
  isGeneratingPlan,
  onUpdateScheduleBlocks,
  onMoveIncompleteTasks,
  currentDayPlan
}: PlannerProps) {
  const [plannerView, setPlannerView] = useState<"timeline" | "month">("timeline");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [gcalSyncState, setGcalSyncState] = useState<"idle" | "syncing" | "synced">("idle");
  
  // Custom Planning Input States
  const [breakPreference, setBreakPreference] = useState<string>(() => {
    return localStorage.getItem("flowmind_break_pref") || "regular";
  });
  const [stressLevel, setStressLevel] = useState<string>(() => {
    return localStorage.getItem("flowmind_stress_lvl") || "medium";
  });
  const [focusConsistency, setFocusConsistency] = useState<string>(() => {
    return localStorage.getItem("flowmind_focus_cons") || "medium";
  });

  // Cycle loader text
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingPhrases = [
    "Analyzing task priorities and timelines...",
    "Calculating recommended focus blocks and rest intervals...",
    "Optimizing schedule based on your current energy level...",
    "Structuring deep focus sessions and breaks...",
    "Designing a supportive and realistic daily plan...",
    "Finalizing your personalized schedule..."
  ];

  useEffect(() => {
    localStorage.setItem("flowmind_break_pref", breakPreference);
  }, [breakPreference]);

  useEffect(() => {
    localStorage.setItem("flowmind_stress_lvl", stressLevel);
  }, [stressLevel]);

  useEffect(() => {
    localStorage.setItem("flowmind_focus_cons", focusConsistency);
  }, [focusConsistency]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGeneratingPlan) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingPhrases.length);
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isGeneratingPlan]);

  // Google Calendar Sync Button handler
  const handleGcalSync = () => {
    setGcalSyncState("syncing");
    setTimeout(() => {
      setGcalSyncState("synced");
    }, 2000);
  };

  // Monthly Calendar parameters
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const currentYear = new Date().getFullYear();
  const currentMonthIdx = new Date().getMonth(); // 0-indexed
  const currentMonthName = new Date().toLocaleString("default", { month: "long" });

  const daysInMonthCount = getDaysInMonth(currentYear, currentMonthIdx);
  const firstDayOfMonthIdx = new Date(currentYear, currentMonthIdx, 1).getDay(); // 0 is Sunday, 1 is Monday...

  const datesArray = [];
  // Fill preceding empty grid squares
  for (let i = 0; i < firstDayOfMonthIdx; i++) {
    datesArray.push(null);
  }
  // Fill dates of current month
  for (let i = 1; i <= daysInMonthCount; i++) {
    const dayStr = i < 10 ? `0${i}` : `${i}`;
    const monthStr = currentMonthIdx + 1 < 10 ? `0${currentMonthIdx + 1}` : `${currentMonthIdx + 1}`;
    datesArray.push(`${currentYear}-${monthStr}-${dayStr}`);
  }

  // Count active tasks for specific calendar date
  const getTasksForDate = (dateStr: string) => {
    return tasks.filter(t => t.dueDate === dateStr);
  };

  const selectedDateTasks = tasks.filter(t => t.dueDate === selectedDate);

  // Focus intensity styles & gradient maps for gorgeous visual hierarchy
  const getIntensityGradient = (intensity?: number, type?: string) => {
    if (type === "break") {
      return "from-emerald-500/15 via-emerald-950/10 to-[#0c0c0e] border-emerald-500/30 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.05)]";
    }
    if (type === "buffer") {
      return "from-amber-500/15 via-amber-950/10 to-[#0c0c0e] border-amber-500/30 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.05)]";
    }
    if (type === "routine") {
      return "from-indigo-500/15 via-indigo-950/10 to-[#0c0c0e] border-indigo-500/30 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.05)]";
    }

    const val = intensity || 3;
    if (val >= 5) {
      return "from-rose-500/20 via-rose-950/15 to-[#0c0c0e] border-rose-500/40 text-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.1)]";
    } else if (val === 4) {
      return "from-cyan-500/20 via-cyan-950/15 to-[#0c0c0e] border-cyan-500/40 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.1)]";
    } else if (val === 3) {
      return "from-blue-500/15 via-blue-950/10 to-[#0c0c0e] border-blue-500/30 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.05)]";
    } else {
      return "from-slate-500/15 via-slate-800/10 to-[#0c0c0e] border-white/10 text-slate-300 shadow-[0_0_15px_rgba(255,255,255,0.02)]";
    }
  };

  const getBurnoutRiskColor = (risk: string) => {
    if (risk === "high") return "text-rose-400 border-rose-500/40 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.15)]";
    if (risk === "medium") return "text-amber-400 border-amber-500/40 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]";
    return "text-cyan-400 border-cyan-500/40 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]";
  };

  return (
    <div id="flowmind-planner-workspace" className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#050507] relative select-none scrollbar-thin">
      
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-cyan-400 animate-pulse" /> AI Daily Planner
          </h1>
          <p className="text-xs text-white/40 mt-1">
            Generate an optimized daily schedule based on your goals, current energy levels, and focus preferences.
          </p>
        </div>

        {/* View Switchers & GCal Sync */}
        <div className="flex items-center gap-3.5 flex-wrap">
          <button
            id="planner-gcal-sync-btn"
            onClick={handleGcalSync}
            disabled={gcalSyncState === "syncing"}
            className={`px-4 py-2.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              gcalSyncState === "synced"
                ? "border-green-500/40 bg-green-500/10 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                : "border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <Clock className={`w-4 h-4 ${gcalSyncState === "syncing" ? "animate-spin" : ""}`} />
            {gcalSyncState === "idle" && "Sync Google Calendar"}
            {gcalSyncState === "syncing" && "Syncing..."}
            {gcalSyncState === "synced" && "Google Calendar Connected"}
          </button>

          {/* Toggle buttons */}
          <div className="flex bg-[#050507] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setPlannerView("timeline")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                plannerView === "timeline"
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white"
              }`}
            >
              Daily Timeline
            </button>
            <button
              onClick={() => setPlannerView("month")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                plannerView === "month"
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white"
              }`}
            >
              Monthly Grid
            </button>
          </div>
        </div>
      </div>

      {/* VIEW PANEL SELECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT & CENTER: ACTIVE PLANNED CALENDAR (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {plannerView === "timeline" ? (
            /* DAILY TIMELINE VIEW */
            <div className="bg-[#0c0c0e]/80 border border-white/10 p-6 rounded-3xl backdrop-blur-md space-y-6">
              
              {/* TIMELINE CONTROLS AND GENERATOR PANEL */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase flex items-center gap-1.5">
                    <Sliders className="w-4 h-4" /> Planner Settings & Options
                  </h3>
                  <span className="text-[10px] font-mono text-white/40">Calibrated: {workHoursStart} - {workHoursEnd}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {/* Mood Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-white/50 uppercase">Current Energy / Mood</label>
                    <select
                      value={mood}
                      onChange={(e) => setMood(e.target.value as Mood)}
                      className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="focused">Focused 🎯</option>
                      <option value="stressed">Stressed 🧠</option>
                      <option value="tired">Tired 💤</option>
                      <option value="energetic">Energetic ⚡</option>
                      <option value="creative">Creative 🎨</option>
                    </select>
                  </div>

                  {/* Break Preference */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-white/50 uppercase">Break Preferences</label>
                    <select
                      value={breakPreference}
                      onChange={(e) => setBreakPreference(e.target.value)}
                      className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="regular">Regular Breaks (25/5 Pomo)</option>
                      <option value="frequent">Frequent Breaks (High Recovery)</option>
                      <option value="minimal">Minimal Breaks (Deep Focus)</option>
                    </select>
                  </div>

                  {/* Stress Level */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-white/50 uppercase">Current Stress Level</label>
                    <select
                      value={stressLevel}
                      onChange={(e) => setStressLevel(e.target.value)}
                      className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="low">Low Stress / Receptive</option>
                      <option value="medium">Medium Stress / Baseline</option>
                      <option value="high">High Stress / Overloaded</option>
                    </select>
                  </div>

                  {/* Focus Consistency */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-white/50 uppercase">Focus Consistency</label>
                    <select
                      value={focusConsistency}
                      onChange={(e) => setFocusConsistency(e.target.value)}
                      className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="high">High (No cognitive drift)</option>
                      <option value="medium">Medium (Standard lapses)</option>
                      <option value="low">Low (Requires heavy buffering)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="text-[11px] text-white/40 flex items-center gap-1.5">
                    <BrainCircuit className="w-4 h-4 text-cyan-400" />
                    <span>Gemini AI organizes your day intelligently based on your priorities and energy level.</span>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      onClick={onMoveIncompleteTasks}
                      title="Move uncompleted tasks to available buffer blocks"
                      className="px-3.5 py-2.5 rounded-xl bg-[#050507] border border-white/10 hover:border-white/20 text-[11px] font-mono font-bold text-white/60 hover:text-white flex items-center justify-center gap-1.5 transition-all w-full sm:w-auto"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Reschedule Incomplete Tasks
                    </button>

                    <button
                      onClick={() => onGenerateAIPlan(breakPreference, stressLevel, focusConsistency)}
                      disabled={isGeneratingPlan}
                      className="px-4 py-2.5 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-white text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all disabled:opacity-50 w-full sm:w-auto cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingPlan ? "animate-spin" : ""}`} />
                      {isGeneratingPlan ? "Regenerating..." : "Generate Daily Plan"}
                    </button>
                  </div>
                </div>
              </div>

              {/* SCHEDULE GENERATION ANIMATION SCREEN */}
              <AnimatePresence mode="wait">
                {isGeneratingPlan ? (
                  <motion.div
                    key="planning-loader"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="border border-white/10 bg-[#050507]/60 rounded-3xl p-12 text-center relative overflow-hidden"
                  >
                    {/* Glowing particle background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 blur-3xl animate-pulse" />
                    
                    <div className="relative space-y-6 max-w-md mx-auto">
                      <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-cyan-500/10 border-t-cyan-400 animate-spin" style={{ animationDuration: "1.2s" }} />
                        <div className="absolute inset-2 rounded-full border-4 border-purple-500/10 border-b-purple-400 animate-spin" style={{ animationDuration: "1.8s" }} />
                        <div className="absolute inset-4 rounded-full border-4 border-indigo-500/10 border-r-indigo-400 animate-spin" style={{ animationDuration: "2.4s" }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BrainCircuit className="w-8 h-8 text-cyan-400 animate-pulse" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-white tracking-widest font-mono uppercase">Generating Your Daily Schedule</h4>
                        <div className="h-5 overflow-hidden relative">
                          <AnimatePresence mode="wait">
                            <motion.p
                              key={loadingStep}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.3 }}
                              className="text-xs text-cyan-300 font-mono"
                            >
                              {loadingPhrases[loadingStep]}
                            </motion.p>
                          </AnimatePresence>
                        </div>
                        <p className="text-[10px] text-white/30 font-mono">Calibrating schedule based on priorities and preferences...</p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="timeline-display"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {/* AESTHETIC PLANNER COCKPIT (HUD) */}
                    {currentDayPlan && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* 1. Burnout Risk Indicator */}
                        <div className={`p-4 rounded-2xl border flex flex-col justify-between h-[120px] transition-all hover:scale-[1.01] ${getBurnoutRiskColor(currentDayPlan.burnoutRisk)}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold tracking-wider uppercase opacity-80">Burnout Risk</span>
                            <ShieldAlert className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xl font-bold tracking-tight uppercase flex items-center gap-1.5">
                              {currentDayPlan.burnoutRisk} Risk
                            </div>
                            <p className="text-[10px] opacity-70 line-clamp-2 leading-snug mt-0.5">{currentDayPlan.burnoutWarning || "Workload and stress indicators are within a healthy range."}</p>
                          </div>
                        </div>

                        {/* 2. Workload Density Meter */}
                        <div className="p-4 rounded-2xl border border-white/10 bg-white/5 flex flex-col justify-between h-[120px] transition-all hover:scale-[1.01]">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-white/40">Workload Density</span>
                            <Activity className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-end">
                              <span className="text-xl font-bold tracking-tight font-mono text-white">{currentDayPlan.workloadDensity}%</span>
                              <span className="text-[9px] font-mono text-white/40 uppercase">
                                {currentDayPlan.workloadDensity > 75 ? "High Workload" : currentDayPlan.workloadDensity > 40 ? "Optimal Flow State" : "Light Workload"}
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${
                                  currentDayPlan.workloadDensity > 75 
                                    ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" 
                                    : currentDayPlan.workloadDensity > 40 
                                    ? "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" 
                                    : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                }`}
                                style={{ width: `${currentDayPlan.workloadDensity}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* 3. Task Completion Confidence */}
                        <div className="p-4 rounded-2xl border border-white/10 bg-white/5 flex flex-col justify-between h-[120px] transition-all hover:scale-[1.01]">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-white/40">Completion Confidence</span>
                            <Gauge className="w-5 h-5 text-purple-400 animate-pulse" />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-end">
                              <span className="text-xl font-bold tracking-tight font-mono text-white">{currentDayPlan.confidenceEstimate}%</span>
                              <span className="text-[9px] font-mono text-white/40 uppercase">Estimated Probability</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-all duration-1000"
                                style={{ width: `${currentDayPlan.confidenceEstimate}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TIMELINE LIST */}
                    <div className="space-y-4 relative">
                      {/* Visual central vertical track axis */}
                      <div className="absolute left-[38px] top-6 bottom-6 w-0.5 bg-white/10" />

                      {scheduleBlocks.length === 0 ? (
                        <div className="text-center py-16 space-y-3 bg-white/5 border border-white/10 rounded-2xl">
                          <CalendarIcon className="w-12 h-12 text-white/20 mx-auto" />
                          <p className="text-sm font-bold text-white/50">No Schedule Blocks</p>
                          <p className="text-xs text-white/40 max-w-sm mx-auto">
                            Set your preferences above and click "Generate Daily Plan" to map out your timeline.
                          </p>
                        </div>
                      ) : (
                        scheduleBlocks.map((block, idx) => {
                          const itemStyle = getIntensityGradient(block.focusIntensity, block.type);
                          return (
                            <motion.div 
                              key={idx}
                              initial={{ opacity: 0, x: -15 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.35, delay: idx * 0.05 }}
                              className="flex gap-6 items-start group relative"
                            >
                              {/* Time stamp sidebar */}
                              <div className="w-[78px] text-right text-xs font-mono font-black text-white/30 group-hover:text-cyan-400 transition-colors pt-2 flex-shrink-0">
                                {block.startTime}
                              </div>

                              {/* Central dot node on the line */}
                              <div className="w-5.5 h-5.5 rounded-full bg-[#050507] border border-white/20 flex items-center justify-center relative z-10 flex-shrink-0 mt-2 transition-all duration-300 group-hover:border-cyan-400 group-hover:bg-cyan-500/10">
                                <div className="w-2 h-2 rounded-full bg-white/30 group-hover:bg-cyan-400" />
                              </div>

                              {/* Detailed scheduled card content */}
                              <div className={`flex-1 border p-4.5 rounded-2xl relative transition-all duration-300 hover:scale-[1.01] bg-gradient-to-b ${itemStyle}`}>
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                                      {block.title}
                                    </h4>
                                    <p className="text-[10px] font-mono text-white/50 mt-0.5">Block Schedule: {block.startTime} - {block.endTime}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {/* Focus Intensity indicators */}
                                    {block.type === "work" && block.focusIntensity && (
                                      <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#050507] border border-white/10 text-[9px] font-mono font-bold text-cyan-400" title={`Focus Intensity: ${block.focusIntensity}/5`}>
                                        <Zap className="w-2.5 h-2.5 fill-cyan-400 animate-pulse text-cyan-400" />
                                        <span>LVL {block.focusIntensity}</span>
                                      </div>
                                    )}
                                    <span className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-[#050507] border border-white/10">
                                      {block.type}
                                    </span>
                                  </div>
                                </div>

                                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                                  {block.description}
                                </p>

                                {block.taskId && (
                                  <div className="mt-3 flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-xl max-w-max">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                    <span className="text-[10px] font-mono text-white/40">Linked Task:</span>
                                    <span className="text-[10px] font-mono font-bold text-white truncate max-w-[150px]">
                                      {tasks.find(t => t.id === block.taskId)?.title || block.taskId}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* MONTHLY CALENDAR GRID VIEW */
            <div className="bg-[#0c0c0e] border border-white/10 p-6 rounded-3xl backdrop-blur-md space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">Monthly Calendar</h3>
                  <p className="text-xs text-white/40 font-mono mt-0.5">{currentMonthName} {currentYear}</p>
                </div>
              </div>

              {/* Day column headers */}
              <div className="grid grid-cols-7 gap-2 text-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <span key={day} className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-wider">{day}</span>
                ))}
              </div>

              {/* Monthly calendar dates grid */}
              <div className="grid grid-cols-7 gap-2">
                {datesArray.map((dateStr, idx) => {
                  if (dateStr === null) {
                    return <div key={idx} className="h-16 rounded-xl bg-[#050507] border border-white/5" />;
                  }

                  const dateObj = new Date(dateStr);
                  const dayNum = dateObj.getDate();
                  const isSelected = selectedDate === dateStr;
                  const isToday = new Date().toISOString().split("T")[0] === dateStr;

                  const dateTasks = getTasksForDate(dateStr);

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`h-16 rounded-xl border p-2 flex flex-col justify-between items-start transition-all relative group text-left ${
                        isSelected
                          ? "bg-[#0c0c0e] border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)] scale-102"
                          : isToday
                          ? "bg-[#050507] border-cyan-400/20 text-white shadow-[inset_0_0_8px_rgba(6,182,212,0.05)]"
                          : "bg-white/5 border border-white/10 hover:border-white/20 text-white/60"
                      }`}
                    >
                      <span className={`text-xs font-mono font-bold ${isToday ? "text-cyan-400 underline" : ""}`}>{dayNum}</span>

                      {/* Active tasks dots indicators */}
                      {dateTasks.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap max-h-[16px] overflow-hidden">
                          {dateTasks.slice(0, 3).map((t) => (
                            <span 
                              key={t.id} 
                              title={t.title}
                              className={`w-1.5 h-1.5 rounded-full ${
                                t.completed 
                                  ? "bg-white/20" 
                                  : t.priority === "high" 
                                  ? "bg-rose-400 shadow-[0_0_5px_rgba(244,63,94,0.4)]" 
                                  : "bg-cyan-400"
                              }`} 
                            />
                          ))}
                          {dateTasks.length > 3 && (
                            <span className="text-[8px] font-mono text-white/30 font-bold">+{dateTasks.length - 3}</span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR: DAILY AGENDA DETAIL & AI INSIGHT PANEL */}
        <div className="space-y-6 flex flex-col">
          
          {/* SECTION 1: SELECTED DATE AGENDA */}
          <div className="bg-[#0c0c0e]/80 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
            <div className="border-b border-white/10 pb-4 mb-4">
              <h3 className="text-sm font-bold text-white tracking-wider flex items-center gap-1.5 uppercase">
                <CalendarIcon className="w-4 h-4 text-cyan-400" /> Daily Agenda
              </h3>
              <p className="text-xs text-white/40 mt-1">
                Selected Date: <strong className="text-cyan-400 font-mono">{selectedDate}</strong>
              </p>
            </div>

            <div className="space-y-3.5 max-h-[300px] overflow-y-auto scrollbar-thin">
              {selectedDateTasks.length === 0 ? (
                <div className="text-center py-10 space-y-2 bg-[#050507] border border-white/10 p-4 rounded-2xl">
                  <CheckCircle2 className="w-8 h-8 text-white/20 mx-auto" />
                  <p className="text-xs font-bold text-white/50">All Clear</p>
                  <p className="text-[11px] text-white/40">No tasks scheduled on this date.</p>
                </div>
              ) : (
                selectedDateTasks.map((task) => (
                  <div key={task.id} className="bg-[#050507] border border-white/10 p-3.5 rounded-xl space-y-2 hover:border-cyan-500/20 transition-all">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-white line-clamp-1">{task.title}</h4>
                      <span className={`text-[8px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                        task.completed 
                          ? "bg-white/10 text-white/40" 
                          : task.priority === "high" 
                          ? "bg-rose-500/15 text-rose-400 border border-rose-500/20" 
                          : "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20"
                      }`}>
                        {task.completed ? "Done" : task.priority}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/60 line-clamp-2 leading-snug">{task.description}</p>
                    <div className="flex items-center justify-between text-[9px] text-white/40 font-mono pt-1">
                      <span>Due: {task.dueTime}</span>
                      <span>Est: {task.duration} mins</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SECTION 2: FUTURISTIC AI INSIGHT PANEL */}
          <div className="bg-[#0c0c0e]/80 border border-white/10 p-6 rounded-3xl backdrop-blur-md space-y-5">
            <div className="border-b border-white/10 pb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-wider flex items-center gap-1.5 uppercase">
                <BrainCircuit className="w-4 h-4 text-purple-400 animate-pulse" /> AI Focus Insights
              </h3>
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>

            {currentDayPlan ? (
              <div className="space-y-4 text-xs">
                {/* Why prioritized */}
                <div className="space-y-1">
                  <h4 className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> Prioritization Strategy
                  </h4>
                  <p className="text-white/70 leading-relaxed bg-[#050507] p-3 rounded-xl border border-white/5">
                    {currentDayPlan.whyPrioritized}
                  </p>
                </div>

                {/* Why recovery */}
                <div className="space-y-1">
                  <h4 className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" /> Focus & Recovery Rationale
                  </h4>
                  <p className="text-white/70 leading-relaxed bg-[#050507] p-3 rounded-xl border border-white/5">
                    {currentDayPlan.whyRecovery}
                  </p>
                </div>

                {/* Tactics */}
                {currentDayPlan.tactics && currentDayPlan.tactics.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> Recommended Strategies
                    </h4>
                    <div className="space-y-2">
                      {currentDayPlan.tactics.map((tactic, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-white/70 bg-white/5 border border-white/5 p-2 rounded-xl">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                          <span>{tactic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Task Probability list */}
                {currentDayPlan.completionProbability && currentDayPlan.completionProbability.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <h4 className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-wider flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-cyan-400" /> Task Completion Analysis
                    </h4>
                    <div className="space-y-3">
                      {currentDayPlan.completionProbability.map((item, idx) => {
                        const prob = item.probability;
                        const isAtRisk = prob < 50;
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-white/80 font-bold truncate max-w-[150px]" title={item.title}>
                                {item.title}
                              </span>
                              <span className={`font-mono font-bold ${isAtRisk ? "text-rose-400" : "text-cyan-400"}`}>
                                {prob}%
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${isAtRisk ? "bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.3)]" : "bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.3)]"}`} 
                                  style={{ width: `${prob}%` }}
                                />
                              </div>
                              {isAtRisk && (
                                <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse flex-shrink-0" title="At risk of delay" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 space-y-3 bg-[#050507] border border-white/10 p-4 rounded-2xl">
                <BrainCircuit className="w-8 h-8 text-white/20 mx-auto" />
                <p className="text-xs font-bold text-white/50">Insights Unavailable</p>
                <p className="text-[11px] text-white/40">Generate an AI schedule to see personalized focus and priority insights.</p>
              </div>
            )}
          </div>

          {/* SUGGESTION CORNER */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-3xl space-y-3">
            <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
              <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '10s' }} /> Planner Tips
            </h4>
            <div className="space-y-2 text-xs text-white/60 leading-relaxed">
              <p>
                To maximize focus and efficiency, FlowMind groups deep work blocks into your high-energy hours. Try to avoid scheduling complex projects late in the day when energy level is naturally lower.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
