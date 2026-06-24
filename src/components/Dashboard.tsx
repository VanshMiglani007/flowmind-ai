import React, { useState } from "react";
import { 
  Sparkles, 
  Flame, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  RefreshCw, 
  Clock, 
  TrendingUp, 
  Briefcase, 
  Heart, 
  ShieldAlert,
  Frown,
  Meh,
  Smile,
  ZapOff,
  Compass
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar,
  Legend
} from "recharts";
import { Task, Habit, Achievement, Mood, AIInsights } from "../types";

interface DashboardProps {
  tasks: Task[];
  habits: Habit[];
  achievements: Achievement[];
  insights: AIInsights;
  mood: Mood;
  setMood: (mood: Mood) => void;
  xp: number;
  level: number;
  triggerAIDiagnostics: () => Promise<void>;
  isGeneratingDiagnostics: boolean;
  onToggleTask: (id: string) => void;
}

export default function Dashboard({
  tasks,
  habits,
  achievements,
  insights,
  mood,
  setMood,
  xp,
  level,
  triggerAIDiagnostics,
  isGeneratingDiagnostics,
  onToggleTask
}: DashboardProps) {
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  // Load onboarding data from localStorage
  const [onboarding] = useState<any>(() => {
    try {
      const saved = localStorage.getItem("flowmind_onboarding");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to parse flowmind_onboarding:", e);
      return null;
    }
  });

  // Time-based Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    let prefix = "Good morning";
    if (hour < 12) prefix = "Good morning";
    else if (hour < 18) prefix = "Good afternoon";
    else prefix = "Good evening";

    if (onboarding && onboarding.name) {
      return `${prefix}, ${onboarding.name}`;
    }
    return prefix;
  };

  // Stats Calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // High risk count
  const highRiskTasks = tasks.filter(t => !t.completed && (t.aiRiskLevel === "high" || t.priority === "high"));

  // Active streaks
  const activeHabitStreaks = habits.length > 0 ? Math.max(...habits.map(h => h.streak), 0) : 0;

  // Mood Configs
  const moodConfig = {
    energetic: { icon: Zap, label: "Energetic", color: "text-amber-400 bg-amber-400/10 border-amber-400/30 shadow-amber-400/20", desc: "High energy. Ideal for tackling complex or demanding tasks." },
    focused: { icon: TargetIcon, label: "Focused", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30 shadow-cyan-400/20", desc: "Laser focus. Ready to dive into deep work sessions." },
    creative: { icon: Sparkles, label: "Creative", color: "text-violet-400 bg-violet-400/10 border-violet-400/30 shadow-violet-400/20", desc: "Creative mindset. Perfect for brainstorming or design work." },
    stressed: { icon: ShieldAlert, label: "Stressed", color: "text-rose-400 bg-rose-400/10 border-rose-400/30 shadow-rose-400/20", desc: "Feeling stressed. Prioritizing low-stress tasks and regular breaks." },
    tired: { icon: BedIcon, label: "Tired", color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/30 shadow-indigo-400/20", desc: "Low energy. Focusing on simple tasks and rest." }
  };

  function TargetIcon(props: any) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    );
  }

  function BedIcon(props: any) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4v16" />
        <path d="M2 8h18a2 2 0 0 1 2 2v10" />
        <path d="M2 17h20" />
        <path d="M6 8v9" />
      </svg>
    );
  }

  // Chart Data preparation
  const categoryCounts: { [key: string]: number } = {};
  tasks.forEach(t => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });
  const categoryChartData = Object.keys(categoryCounts).map(cat => ({
    name: cat,
    value: categoryCounts[cat]
  }));

  const COLORS = ["#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

  const weeklyActivityData = [
    { day: "Mon", completed: 3, goal: 4 },
    { day: "Tue", completed: 4, goal: 5 },
    { day: "Wed", completed: 2, goal: 4 },
    { day: "Thu", completed: 5, goal: 4 },
    { day: "Fri", completed: 6, goal: 5 },
    { day: "Sat", completed: 3, goal: 3 },
    { day: "Sun", completed: completedTasks, goal: 4 } // Updates live with user's current progress
  ];

  const focusTrendData = [
    { name: "Week 1", hours: 12 },
    { name: "Week 2", hours: 18 },
    { name: "Week 3", hours: 15 },
    { name: "Week 4", hours: 22 },
    { name: "Current", hours: 14 + (completedTasks * 1.5) } // Scales based on tasks done
  ];

  const currentMoodInfo = moodConfig[mood];
  const CurrentMoodIcon = currentMoodInfo.icon;

  // Level & XP details
  const getRankTitle = (lvl: number) => {
    if (lvl === 1) return "Flow Initiate";
    if (lvl === 2) return "Momentum Builder";
    if (lvl === 3) return "Focus Architect";
    if (lvl === 4) return "Productivity Strategist";
    return "Deep Work Master";
  };

  const currentLevelXp = xp % 500;
  const progressPercent = Math.min(100, Math.round((currentLevelXp / 500) * 100));
  const xpNeeded = 500 - currentLevelXp;

  // Behavioral Biometrics calculations
  const tasksWithProcrastination = tasks.filter(t => t.procrastinationCount > 0);
  const completedProcrastinated = tasksWithProcrastination.filter(t => t.completed).length;
  const procrastinationRecoveryRate = tasksWithProcrastination.length > 0 
    ? Math.round((completedProcrastinated / tasksWithProcrastination.length) * 100) 
    : 100;

  const completedHabitsThisWeek = habits.reduce((acc, h) => acc + h.completedDates.length, 0);
  const focusConsistency = Math.min(100, Math.round((completionRate * 0.5) + (completedHabitsThisWeek * 6) + 30));

  const momentumScore = Math.min(100, Math.round((activeHabitStreaks * 8) + (completionRate * 0.4) + (completedTasks * 5)));

  const getMomentumTitle = (score: number) => {
    if (score <= 30) return "Starting Point";
    if (score <= 60) return "Steady Progress";
    if (score <= 85) return "High Focus";
    return "Peak Focus";
  };

  const getEncouragementMessage = () => {
    if (highRiskTasks.length > 2) {
      return {
        text: "Multiple items are at risk of missing deadlines. Try starting a focus session to rebuild momentum.",
        color: "text-rose-400 border-rose-500/25 bg-rose-500/5"
      };
    }
    if (momentumScore >= 85) {
      return {
        text: "Excellent work! Your focus score is exceptional and you are in a great flow state.",
        color: "text-amber-400 border-amber-500/25 bg-amber-500/5"
      };
    }
    if (procrastinationRecoveryRate >= 75 && tasksWithProcrastination.length > 0) {
      return {
        text: "Great progress on overdue tasks! You are actively overcoming procrastination patterns.",
        color: "text-emerald-400 border-emerald-500/25 bg-emerald-500/5"
      };
    }
    if (focusConsistency < 50) {
      return {
        text: "Let's build consistency. Setting small, steady habits is the best way to develop focus.",
        color: "text-indigo-400 border-indigo-500/25 bg-indigo-500/5"
      };
    }
    return {
      text: "Your daily focus and productivity are fully balanced. Keep up the consistent work!",
      color: "text-cyan-400 border-cyan-500/25 bg-cyan-500/5"
    };
  };

  const encouragement = getEncouragementMessage();

  return (
    <div id="flowmind-dashboard" className="flex-1 p-8 overflow-y-auto space-y-8 bg-[#050507] relative select-none">
      {/* 1. FUTURISTIC ONBOARDING BANNER WITH XP HUD */}
      <header className="rounded-2xl border border-white/10 bg-[#0c0c0e] p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
        <div className="space-y-4 relative z-10 w-full md:max-w-2xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} /> 
              Productivity Focus Active
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">{getGreeting()}</h2>
            <p className="text-white/60 text-sm max-w-xl leading-relaxed">
              {onboarding ? (
                <>
                  Ready to conquer your day as a <span className="text-cyan-400 font-bold">{onboarding.workType}</span>? 
                  We are actively optimizing focus to mitigate <span className="text-indigo-400 font-bold">{onboarding.struggle}</span>. 
                  Today you have <span className="text-cyan-400 font-bold"> {pendingTasks} pending tasks</span> aligned for your preferred hours ({onboarding.workHoursStart} — {onboarding.workHoursEnd}).
                </>
              ) : (
                <>
                  Welcome back. Your dashboard is ready. Today you have 
                  <span className="text-cyan-400 font-bold"> {pendingTasks} pending tasks</span> and some recommended focus blocks.
                </>
              )}
            </p>
          </div>

          {/* HUD Progress Bar */}
          <div className="bg-[#050507] p-3.5 rounded-xl border border-white/10 max-w-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-cyan-400 font-bold flex items-center gap-1.5">
                <Award className="w-4 h-4 text-cyan-400" />
                Level {level} ({getRankTitle(level)})
              </span>
              <span className="font-mono text-white/50">{currentLevelXp}/500 XP ({xpNeeded} XP to next level)</span>
            </div>
            <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Mood Selector Widget */}
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl w-full md:w-auto min-w-[320px] flex flex-col gap-3 relative z-10 backdrop-blur-md">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-white/50 uppercase tracking-wider">Current Energy Level</span>
            <span className="text-[10px] bg-cyan-400/10 text-cyan-400 px-2 py-0.5 rounded-full font-mono">Mood</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className={`p-3 rounded-xl border ${currentMoodInfo.color} transition-all duration-500 shadow-[0_0_15px_rgba(0,0,0,0.1)]`}>
              <CurrentMoodIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{currentMoodInfo.label}</h4>
              <p className="text-[11px] text-white/50 leading-tight max-w-[200px]">{currentMoodInfo.desc}</p>
            </div>
          </div>
          {/* Mood Selector Toggles */}
          <div className="grid grid-cols-5 gap-1 pt-1 border-t border-white/10">
            {(Object.keys(moodConfig) as Mood[]).map((m) => {
              const info = moodConfig[m];
              const Icon = info.icon;
              const isSelected = mood === m;
              return (
                <button
                  key={m}
                  id={`mood-btn-${m}`}
                  onClick={() => setMood(m)}
                  title={info.label}
                  className={`py-2 rounded-lg flex flex-col items-center justify-center border transition-all ${
                    isSelected 
                      ? "bg-white/10 border-cyan-500/50 text-cyan-400 scale-105 shadow-[0_0_10px_rgba(6,182,212,0.2)]" 
                      : "bg-transparent border-white/5 hover:border-white/10 text-white/50 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Grid of Key Numerical cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Core level card */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between hover:border-white/20 transition-all group">
          <div className="space-y-1">
            <p className="text-xs font-mono font-bold text-white/50 uppercase tracking-wider">Productivity Level</p>
            <h3 className="text-2xl font-black text-white flex items-baseline gap-1.5">
              Rank {level}
              <span className="text-xs font-mono font-bold text-cyan-400">{getRankTitle(level)}</span>
            </h3>
            <p className="text-xs text-white/55">Total XP: {xp} points</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Completion rate card */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between hover:border-white/20 transition-all group">
          <div className="space-y-1">
            <p className="text-xs font-mono font-bold text-white/50 uppercase tracking-wider">Completion rate</p>
            <h3 className="text-2xl font-black text-white flex items-baseline gap-1.5">
              {completionRate}%
              <span className="text-xs font-mono font-bold text-green-400">{completedTasks}/{totalTasks} Done</span>
            </h3>
            <p className="text-xs text-white/55">Daily goal: 4 items</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 group-hover:bg-green-500/20 transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Habit loop streaks */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between hover:border-white/20 transition-all group">
          <div className="space-y-1">
            <p className="text-xs font-mono font-bold text-white/50 uppercase tracking-wider">Habit Streak</p>
            <h3 className="text-2xl font-black text-white flex items-baseline gap-1.5">
              {activeHabitStreaks} Days
              <span className="text-xs font-mono font-bold text-amber-500">Unbroken</span>
            </h3>
            <p className="text-xs text-white/55">Keep your streak going!</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:bg-amber-500/20 transition-all shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Procrastination items */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between hover:border-white/20 transition-all group">
          <div className="space-y-1">
            <p className="text-xs font-mono font-bold text-white/50 uppercase tracking-wider">Focus Alerts</p>
            <h3 className="text-2xl font-black text-white flex items-baseline gap-1.5">
              {highRiskTasks.length} Overdue
              {highRiskTasks.length > 0 && <span className="text-xs font-mono font-bold text-rose-500">High Risk</span>}
            </h3>
            <p className="text-xs text-white/55">Deadlines approaching</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:bg-rose-500/20 transition-all shadow-[0_0_15px_rgba(244,63,94,0.1)]">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* BEHAVIORAL INSIGHTS & MOTIVATIONAL BIOMETRICS */}
      <section className="bg-[#0c0c0e] border border-white/10 p-6 rounded-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              Weekly Progress & Focus Metrics
            </h3>
            <p className="text-xs text-white/40">Real-time indicators tracking your consistency and task completion</p>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-400/5 border border-cyan-500/20 px-2 py-0.5 rounded-full">Live Analysis</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Procrastination Recovery Rate */}
          <div className="bg-[#050507] border border-white/10 p-4 rounded-xl flex flex-col justify-between space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs font-mono font-bold text-white/50 uppercase tracking-wider">Overdue Task Resolution</h4>
                <p className="text-[11px] text-white/40">Percentage of overdue tasks completed</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">{procrastinationRecoveryRate}%</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-500"
                style={{ width: `${procrastinationRecoveryRate}%` }}
              />
            </div>
            <p className="text-[10px] text-white/50 leading-relaxed font-sans">
              Tracks completed tasks that were previously delayed.
            </p>
          </div>

          {/* Focus Consistency */}
          <div className="bg-[#050507] border border-white/10 p-4 rounded-xl flex flex-col justify-between space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs font-mono font-bold text-white/50 uppercase tracking-wider">Focus Consistency</h4>
                <p className="text-[11px] text-white/40">Weekly focus score</p>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400">{focusConsistency}%</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all duration-500"
                style={{ width: `${focusConsistency}%` }}
              />
            </div>
            <p className="text-[10px] text-white/50 leading-relaxed font-sans">
              A weighted score based on completed tasks and habits.
            </p>
          </div>

          {/* Productivity Momentum */}
          <div className="bg-[#050507] border border-white/10 p-4 rounded-xl flex flex-col justify-between space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs font-mono font-bold text-white/50 uppercase tracking-wider">Focus Momentum</h4>
                <p className="text-[11px] text-white/40 font-mono">Consistent action progress</p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-500">{momentumScore}% ({getMomentumTitle(momentumScore)})</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-all duration-500"
                style={{ width: `${momentumScore}%` }}
              />
            </div>
            <p className="text-[10px] text-white/50 leading-relaxed font-sans">
              Measures active habit streaks and task completion rates.
            </p>
          </div>
        </div>

        {/* Dynamic Adaptive Encouragement Message */}
        <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${encouragement.color} transition-all duration-500`}>
          <Sparkles className="w-5 h-5 flex-shrink-0 animate-pulse" />
          <p className="text-xs font-mono font-semibold tracking-wide leading-relaxed">{encouragement.text}</p>
        </div>
      </section>

      {/* Bento Main Layout: AI Insights Hub & Action Panel */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT & MID: AI Diagnostic & Performance Insights (2 Columns width) */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between bg-[#0c0c0e] border border-white/10 p-6 rounded-2xl relative overflow-hidden">
          {/* Diagnostic pulsing particle */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-indigo-500/5 blur-[50px] pointer-events-none" />

          {/* Heading */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <h3 className="text-lg font-bold text-white tracking-wide">AI Insights & Diagnostics</h3>
              </div>
              <p className="text-xs text-white/40 font-mono">Powered by Gemini AI</p>
            </div>
            
            <button
              id="dashboard-calibrate-ai-btn"
              onClick={triggerAIDiagnostics}
              disabled={isGeneratingDiagnostics}
              className="px-4 py-2 text-xs font-mono font-bold rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingDiagnostics ? "animate-spin" : ""}`} />
              {isGeneratingDiagnostics ? "Analyzing..." : "Refresh AI Analysis"}
            </button>
          </div>

          {/* Diagnosis body */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 flex-1">
            {/* Scores bento segment */}
            <div className="space-y-5 flex flex-col justify-center bg-[#050507] border border-white/10 p-4 rounded-xl">
              {/* Score 1 */}
              <div className="text-center relative">
                <div className="inline-flex flex-col items-center justify-center p-3 rounded-full border border-white/10 w-24 h-24 relative">
                  <span className="text-2xl font-black text-white tracking-tight">{insights.productivityScore}</span>
                  <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest">Productivity</span>
                </div>
              </div>

              {/* Score 2 */}
              <div className="text-center">
                <div className="inline-flex flex-col items-center justify-center p-3 rounded-full border border-white/10 w-24 h-24 relative">
                  <span className="text-2xl font-black text-white tracking-tight">{insights.focusScore}</span>
                  <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest">Focus Score</span>
                </div>
              </div>
            </div>

            {/* Analysis & Burnout Warnings */}
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-1.5">
                <h4 className="text-xs font-mono font-bold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" /> Weekly Performance Review
                </h4>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-white/80 text-sm leading-relaxed font-sans relative">
                  {insights.weeklyAnalysis}
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-mono font-bold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Burnout Risk & Stress Analysis
                </h4>
                <div className="bg-rose-500/5 border border-rose-500/25 p-4 rounded-xl flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-300 leading-normal">{insights.burnoutWarning}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bullet points performance insights */}
          <div className="border-t border-white/10 pt-4 bg-[#050507] p-4 rounded-xl border border-white/10">
            <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2.5">Key Recommendations</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-white/80 font-sans">
              {insights.performanceInsights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-white/5 border border-white/5 p-2.5 rounded-xl">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT: High Priority Actions & Dynamic Risk Predictor */}
        <div className="space-y-6 flex flex-col justify-between bg-[#0c0c0e] border border-white/10 p-6 rounded-2xl">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" /> Task Risk Analysis
            </h3>
            <p className="text-xs text-white/40">Estimated risk of missing upcoming deadlines</p>
          </div>

          {/* Deadlines Risk Feed */}
          <div className="flex-1 space-y-4 py-4 overflow-y-auto max-h-[300px] scrollbar-thin">
            {tasks.filter(t => !t.completed).length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto" />
                <p className="text-sm font-bold text-white">No Pending Tasks</p>
                <p className="text-xs text-white/40">All of your planned tasks are complete.</p>
              </div>
            ) : (
              tasks.filter(t => !t.completed).slice(0, 3).map((task) => {
                const isHigh = task.aiRiskLevel === "high" || task.priority === "high";
                const isMed = task.aiRiskLevel === "medium";
                const percentage = task.aiRiskPercentage || (task.priority === "high" ? 75 : task.priority === "medium" ? 40 : 15);
                const colorClass = isHigh ? "from-rose-500 to-red-600 text-rose-400" : isMed ? "from-amber-400 to-orange-500 text-amber-400" : "from-emerald-400 to-teal-500 text-teal-400";
                
                return (
                  <div key={task.id} className="bg-[#050507] border border-white/10 p-4 rounded-xl space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-wide line-clamp-1">{task.title}</h4>
                        <p className="text-[10px] font-mono text-white/40">{task.category}</p>
                      </div>
                      <span className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded-md ${isHigh ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : isMed ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-teal-500/10 text-teal-400 border border-teal-500/20"}`}>
                        {percentage}% Risk
                      </span>
                    </div>

                    {/* Risk progress meter */}
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${colorClass} rounded-full`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-white/70 leading-snug bg-white/5 p-2 rounded-xl border border-white/5">
                      <strong>AI analysis:</strong> {task.aiRiskReason || "Moderate workload factor with standard scheduled cushion. Complete subtasks to sustain low risk."}
                    </p>

                    {task.aiCorrectiveAction && (
                      <p className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                        <Zap className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                        <span>Recommended Action: {task.aiCorrectiveAction}</span>
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Checklist for high-priority items */}
          <div className="border-t border-white/10 pt-4 bg-[#050507] border border-white/10 p-3.5 rounded-xl space-y-2.5">
            <h4 className="text-xs font-mono font-bold text-white/40 uppercase tracking-wider">High Priority Actions</h4>
            <div className="space-y-2">
              {tasks.filter(t => !t.completed && t.priority === "high").slice(0, 2).map(task => (
                <label 
                  key={task.id} 
                  id={`dashboard-quick-task-${task.id}`}
                  className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 p-2.5 rounded-xl cursor-pointer transition-all"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onToggleTask(task.id)}
                    className="rounded text-cyan-500 bg-white/5 border-white/10 focus:ring-cyan-500 focus:ring-offset-[#050507] w-4.5 h-4.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{task.title}</p>
                    <p className="text-[9px] font-mono text-white/40">{task.dueDate}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Display Charts & Gamification Badge Showcase */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Productivity & Category Charts */}
        <div className="lg:col-span-2 bg-[#0c0c0e] border border-white/10 p-6 rounded-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">Productivity Metrics</h3>
              <p className="text-xs text-white/40">Weekly focus and task completion rates</p>
            </div>
            <span className="text-[10px] font-mono text-white/40 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">Analytics</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[250px]">
            {/* Weekly Completion Rate Chart */}
            <div className="flex flex-col h-full bg-[#050507] p-3 rounded-xl border border-white/10">
              <h4 className="text-xs font-mono font-bold text-white/50 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Weekly Task Completion</span>
                <span className="text-[10px] text-cyan-400">Task History</span>
              </h4>
              <div className="flex-1 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyActivityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: "#0c0c0e", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                    <Area type="monotone" dataKey="completed" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCompleted)" name="Completed" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Pie Chart / Focus Hours Trend */}
            <div className="flex flex-col h-full bg-[#050507] p-3 rounded-xl border border-white/10">
              <h4 className="text-xs font-mono font-bold text-white/50 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Focus Hours Trend</span>
                <span className="text-[10px] text-violet-400">Focus Trend</span>
              </h4>
              <div className="flex-1 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={focusTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: "#0c0c0e", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                    <Bar dataKey="hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Focus Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Gamified Achievements / Milestones */}
        <div className="bg-[#0c0c0e] border border-white/10 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="border-b border-white/10 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500 animate-bounce" /> Milestones & Badges
              </h3>
              <p className="text-xs text-white/40">Your productivity awards and achievements</p>
            </div>

            {/* Achievements board */}
            <div className="grid grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
              {achievements.map((ach) => {
                const getIcon = (name: string) => {
                  switch (name) {
                    case "Zap": return Zap;
                    case "ShieldCheck": return ShieldAlert;
                    case "Flame": return Flame;
                    case "Compass": return Compass;
                    case "CheckCircle2": return CheckCircle2;
                    case "Clock": return Clock;
                    case "TrendingUp": return TrendingUp;
                    case "Sparkles": return Sparkles;
                    default: return Sparkles;
                  }
                };
                const IconComponent = getIcon(ach.iconName);
                
                return (
                  <div
                    key={ach.id}
                    id={`achievement-card-${ach.id}`}
                    onMouseEnter={() => setHoveredBadge(ach.id)}
                    onMouseLeave={() => setHoveredBadge(null)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-300 relative group cursor-pointer ${
                      ach.unlocked
                        ? "bg-[#050507] border-yellow-500/20 hover:border-yellow-500/40 hover:bg-yellow-500/5 shadow-[0_0_15px_rgba(234,179,8,0.05)]"
                        : "bg-white/5 border-white/5 text-white/20 grayscale opacity-40 hover:opacity-60"
                    }`}
                  >
                    {/* Pulsing neon for unlocked */}
                    {ach.unlocked && (
                      <div className="absolute inset-0 bg-yellow-500/2 rounded-2xl blur-lg group-hover:bg-yellow-500/5 transition-all" />
                    )}

                    <div className={`p-2.5 rounded-xl mb-2 ${ach.unlocked ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : "bg-white/5 text-white/30"}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-1">{ach.title}</h4>
                    <span className="text-[9px] font-mono text-yellow-500 font-extrabold mt-1">+{ach.xpAwarded} XP</span>

                    {/* Custom hover tooltip */}
                    {hoveredBadge === ach.id && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[#0c0c0e] border border-white/10 p-2.5 rounded-xl shadow-xl z-20 pointer-events-none text-left">
                        <h5 className="text-xs font-bold text-white">{ach.title}</h5>
                        <p className="text-[10px] text-white/60 mt-1">{ach.description}</p>
                        <p className="text-[9px] font-mono text-white/40 mt-1.5 uppercase font-bold">
                          {ach.unlocked ? `Unlocked: ${new Date(ach.unlockedAt || "").toLocaleDateString()}` : "Locked"}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 bg-[#050507] border border-white/10 p-3 rounded-xl text-center">
            <span className="text-xs text-white/40 font-mono">Completed Achievements: </span>
            <span className="text-xs font-bold text-yellow-400 font-mono">
              {achievements.filter(a => a.unlocked).length} / {achievements.length}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
