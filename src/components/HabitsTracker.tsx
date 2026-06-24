import React, { useState } from "react";
import { 
  Activity, 
  Flame, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Award, 
  Sparkles,
  TrendingUp,
  RotateCcw
} from "lucide-react";
import { Habit } from "../types";

interface HabitsTrackerProps {
  habits: Habit[];
  onAddHabit: (habit: Partial<Habit>) => void;
  onToggleHabitDate: (habitId: string, dateStr: string) => void;
  onDeleteHabit: (id: string) => void;
  xp: number;
}

export default function HabitsTracker({
  habits,
  onAddHabit,
  onToggleHabitDate,
  onDeleteHabit,
  xp
}: HabitsTrackerProps) {
  // Habit Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [habitTitle, setHabitTitle] = useState("");
  const [habitCategory, setHabitCategory] = useState("Productivity");
  const [habitFrequency, setHabitFrequency] = useState<"daily" | "weekly">("daily");
  const [habitXpValue, setHabitXpValue] = useState(20);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;

    onAddHabit({
      title: habitTitle,
      category: habitCategory,
      frequency: habitFrequency,
      xpValue: Number(habitXpValue),
      streak: 0,
      maxStreak: 0,
      completedDates: []
    });

    setHabitTitle("");
    setHabitCategory("Productivity");
    setHabitFrequency("daily");
    setHabitXpValue(20);
    setIsFormOpen(false);
  };

  // Generate weekday headings for past 7 days to toggle logs
  const getPastWeekDates = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push({
        dateStr: d.toISOString().split("T")[0],
        dayName: d.toLocaleDateString("default", { weekday: "short" }),
        dayNum: d.getDate()
      });
    }
    return dates;
  };

  const pastWeekDates = getPastWeekDates();
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div id="flowmind-habits-workspace" className="flex-1 p-8 overflow-y-auto bg-[#050507] relative select-none">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Activity className="w-7 h-7 text-cyan-400" /> Habits Tracker
          </h1>
          <p className="text-xs text-white/40 mt-1">
            Build consistent daily routines. Log your habits to keep your streak going.
          </p>
        </div>

        <button
          id="habit-btn-open-add"
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:shadow-[0_0_20px_rgba(34,211,238,0.25)] text-white text-xs font-bold font-sans flex items-center gap-2 border border-white/10 transition-all"
        >
          <Plus className="w-4.5 h-4.5" /> Add Habit
        </button>
      </div>

      {/* NEW HABIT REGISTRATION FORM */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-[#0c0c0e] border border-white/10 p-6 rounded-2xl mb-8 space-y-4 backdrop-blur-md max-w-2xl">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Plus className="w-4.5 h-4.5 text-cyan-400" /> Add New Habit
            </h3>
            <span className="text-[10px] text-white/40 font-mono">Habit Details</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Habit name */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-mono uppercase text-white/40 font-bold">Habit Title</label>
              <input
                type="text"
                required
                value={habitTitle}
                onChange={(e) => setHabitTitle(e.target.value)}
                placeholder="Morning Planning, Read research paper, 90m focus sprint..."
                className="w-full bg-[#050507] border border-white/10 focus:border-cyan-500/50 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none"
              />
            </div>

            {/* Category selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-white/40 font-bold">Category</label>
              <select
                value={habitCategory}
                onChange={(e) => setHabitCategory(e.target.value)}
                className="w-full bg-[#050507] border border-white/10 focus:border-cyan-500/50 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none"
              >
                <option value="Productivity">Productivity</option>
                <option value="Focus">Focus</option>
                <option value="Well-being">Well-being</option>
                <option value="Fitness">Fitness</option>
              </select>
            </div>

            {/* XP Value reward */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-white/40 font-bold">XP Reward</label>
              <input
                type="number"
                value={habitXpValue}
                onChange={(e) => setHabitXpValue(Number(e.target.value))}
                min={5}
                max={100}
                className="w-full bg-[#050507] border border-white/10 focus:border-cyan-500/50 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-mono bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-cyan-400 hover:bg-cyan-500 text-black rounded-lg transition-all"
            >
              Add Habit
            </button>
          </div>
        </form>
      )}

      {/* HABITS GRID */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {habits.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-[#0c0c0e] border border-white/10 rounded-2xl space-y-4 max-w-2xl mx-auto p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-violet-500/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mx-auto mb-2 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
              <Activity className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">No habits tracked yet</h3>
            <p className="text-xs text-white/50 max-w-md mx-auto leading-relaxed">
              Start building consistency by initializing focus routine loops. Maintain habit streaks, acquire XP multipliers, and strengthen your focus metrics.
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-400 via-purple-500 to-indigo-600 text-white text-xs font-bold font-sans flex items-center gap-2 mx-auto hover:shadow-[0_0_15px_rgba(139,92,246,0.25)] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Your First Habit
            </button>
          </div>
        ) : (
          habits.map((habit) => {
            const hasCompletedToday = habit.completedDates.includes(todayStr);
            return (
              <div
                key={habit.id}
                id={`habit-card-${habit.id}`}
                className="bg-[#0c0c0e] border border-white/10 p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between gap-5 transition-all hover:border-white/20 group"
              >
                {/* Header row details */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-400/15 border border-cyan-400/20 px-2 py-0.5 rounded">
                      {habit.category}
                    </span>
                    <h3 className="text-base font-bold text-white tracking-wide mt-1.5">{habit.title}</h3>
                  </div>

                  {/* Actions & Streak Badge */}
                  <div className="flex items-center gap-3.5">
                    {/* Streaks count */}
                    <div className="flex items-center gap-1 text-sm font-mono font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.05)] animate-pulse">
                      <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span>{habit.streak} day streak</span>
                    </div>

                    <button
                      onClick={() => onDeleteHabit(habit.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/15 border border-transparent hover:border-rose-500/20 text-white/30 hover:text-rose-400 transition-all"
                      title="Delete Habit"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>

                {/* 7-DAY TOGGLE GRAPH (GAMIFIED SQUARES) */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-wider">Weekly Progress (Past 7 Days)</h4>
                  <div className="grid grid-cols-7 gap-2.5">
                    {pastWeekDates.map((day) => {
                      const isCompleted = habit.completedDates.includes(day.dateStr);
                      const isToday = day.dateStr === todayStr;

                      return (
                        <button
                          key={day.dateStr}
                          id={`habit-toggle-${habit.id}-${day.dateStr}`}
                          onClick={() => onToggleHabitDate(habit.id, day.dateStr)}
                          className={`flex flex-col items-center justify-between p-2 rounded-xl border transition-all ${
                            isCompleted
                              ? "bg-cyan-500 border-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                              : isToday
                              ? "bg-[#050507] border-cyan-500/30 hover:border-cyan-400/40 text-cyan-400"
                              : "bg-white/5 border border-white/10 hover:border-white/20 text-white/40 hover:text-white"
                          }`}
                        >
                          <span className="text-[9px] font-mono font-bold uppercase">{day.dayName}</span>
                          <span className="text-xs font-mono font-bold mt-1">{day.dayNum}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer specs / achievements comparison */}
                <div className="flex items-center justify-between border-t border-white/10 pt-3.5 mt-1 text-xs font-mono text-white/40">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Record streak: {habit.maxStreak} days
                  </span>
                  <span className="text-cyan-400 font-bold">
                    Reward: +{habit.xpValue} XP
                  </span>
                </div>

              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
