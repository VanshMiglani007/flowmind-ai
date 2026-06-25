import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  initialTasks, 
  initialHabits, 
  initialScheduleBlocks, 
  initialAchievements, 
  defaultSettings, 
  initialInsights 
} from "./initialData";
import { Task, Habit, ScheduleBlock, Achievement, UserSettings, AIInsights, Mood, DayPlan } from "./types";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import TaskManager from "./components/TaskManager";
import Planner from "./components/Planner";
import FocusMode from "./components/FocusMode";
import HabitsTracker from "./components/HabitsTracker";
import AICoach from "./components/AICoach";
import Settings from "./components/Settings";
import LandingPage, { OnboardingData } from "./components/LandingPage";
import { getDemoWorkspaceData } from "./utils/demoLoader";
import { Sparkles, Award, Zap, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { fetchWithRetry, getOfflineQueue, saveOfflineQueue, isQuotaError } from "./utils/aiHelper";

export default function App() {
  // Landing Page & Onboarding state hydrated from localStorage
  const [showLanding, setShowLanding] = useState<boolean>(() => {
    const entered = localStorage.getItem("flowmind_entered_workspace");
    return entered ? false : true;
  });

  const [isDemoActive, setIsDemoActive] = useState<boolean>(() => {
    return localStorage.getItem("flowmind_is_demo") === "true";
  });

  const [onboarding, setOnboarding] = useState<OnboardingData | null>(() => {
    try {
      const saved = localStorage.getItem("flowmind_onboarding");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to parse flowmind_onboarding:", e);
      return null;
    }
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Core Data States with LocalStorage Hydration
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("flowmind_tasks");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(task => ({
            ...task,
            createdAt: task.createdAt || new Date(task.createdDate || Date.now()).getTime(),
            updatedAt: task.updatedAt || new Date(task.createdDate || Date.now()).getTime()
          }));
        }
      } catch (e) {
        console.error("Failed to parse flowmind_tasks:", e);
      }
    }
    return initialTasks.map(task => ({
      ...task,
      createdAt: task.createdAt || new Date(task.createdDate || Date.now()).getTime(),
      updatedAt: task.updatedAt || new Date(task.createdDate || Date.now()).getTime()
    }));
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem("flowmind_habits");
      return saved ? JSON.parse(saved) : initialHabits;
    } catch (e) {
      console.error("Failed to parse flowmind_habits:", e);
      return initialHabits;
    }
  });

  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>(() => {
    try {
      const saved = localStorage.getItem("flowmind_schedule");
      return saved ? JSON.parse(saved) : initialScheduleBlocks;
    } catch (e) {
      console.error("Failed to parse flowmind_schedule:", e);
      return initialScheduleBlocks;
    }
  });

  const [currentDayPlan, setCurrentDayPlan] = useState<DayPlan | null>(() => {
    try {
      const saved = localStorage.getItem("flowmind_day_plan");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to parse flowmind_day_plan:", e);
      return null;
    }
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const saved = localStorage.getItem("flowmind_achievements");
      return saved ? JSON.parse(saved) : initialAchievements;
    } catch (e) {
      console.error("Failed to parse flowmind_achievements:", e);
      return initialAchievements;
    }
  });

  const [xp, setXp] = useState<number>(() => {
    const saved = localStorage.getItem("flowmind_xp");
    return saved ? Number(saved) : 320; // Default starts at 320 XP
  });

  const [level, setLevel] = useState<number>(() => {
    const saved = localStorage.getItem("flowmind_level");
    return saved ? Number(saved) : 1;
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem("flowmind_settings");
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch (e) {
      console.error("Failed to parse flowmind_settings:", e);
      return defaultSettings;
    }
  });

  const [insights, setInsights] = useState<AIInsights>(() => {
    try {
      const saved = localStorage.getItem("flowmind_insights");
      return saved ? JSON.parse(saved) : initialInsights;
    } catch (e) {
      console.error("Failed to parse flowmind_insights:", e);
      return initialInsights;
    }
  });

  const [mood, setMood] = useState<Mood>("focused");

  // Real-time HUD notifications
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "xp" | "achievement" | "level" | "streak"; value?: number }[]>([]);

  const triggerToast = (message: string, type: "xp" | "achievement" | "level" | "streak" = "xp", value?: number) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type, value }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Daily productivity milestone state tracking
  const [lastMilestoneDate, setLastMilestoneDate] = useState<string>(() => {
    return localStorage.getItem("flowmind_last_daily_milestone") || "";
  });

  useEffect(() => {
    localStorage.setItem("flowmind_last_daily_milestone", lastMilestoneDate);
  }, [lastMilestoneDate]);

  // Loading indicator states for actual server-side queries
  const [isGeneratingDiagnostics, setIsGeneratingDiagnostics] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isPrioritizingTask, setIsPrioritizingTask] = useState<string | null>(null);
  const [isBreakingDownTask, setIsBreakingDownTask] = useState<string | null>(null);

  // Level up alert state
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [unlockedLevel, setUnlockedLevel] = useState(1);

  // Network and AI Coach live state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isCoachLive, setIsCoachLive] = useState(false);

  // Quota protection state — separate from "live" status
  const [quotaExhausted, setQuotaExhausted] = useState(false);
  const [quotaCooldownSeconds, setQuotaCooldownSeconds] = useState(0);
  const quotaTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);


  const handleSyncOfflineQueue = async () => {
    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    triggerToast(`Synaptic handshaking... processing ${queue.length} buffered queries.`, "streak");
    
    let processedCount = 0;
    const remainingQueue = [...queue];

    for (const item of queue) {
      try {
        const responseText = await handleSendMessageToAI(item.contents, item.systemInstruction);
        const savedMessages = localStorage.getItem("flowmind_coach_messages");
        if (savedMessages) {
          const parsed = JSON.parse(savedMessages);
          parsed.push({ role: "model", text: responseText, timestamp: Date.now() });
          localStorage.setItem("flowmind_coach_messages", JSON.stringify(parsed));
        }
        processedCount++;
        remainingQueue.shift();
      } catch (err) {
        console.error("Failed to sync item from queue", err);
        break; 
      }
    }

    saveOfflineQueue(remainingQueue);

    if (processedCount > 0) {
      triggerToast(`Uplink synchronized! Flushed ${processedCount} buffered analytics to logs.`, "achievement");
      window.dispatchEvent(new Event("flowmind_chat_sync"));
    }
  };

  // Passive health check — only called on app load and reconnect, NOT on a timer
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/health", { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        setIsCoachLive(true);
      } else {
        setIsCoachLive(false);
      }
    } catch {
      setIsCoachLive(false);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerToast("Cognitive link re-established! Synchronizing buffered logs.", "streak", 15);
      checkHealth(); // Re-check backend on reconnect
      handleSyncOfflineQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setIsCoachLive(false);
      triggerToast("Terminal offline. Switching to cognitive backup buffers.", "xp", 0);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // One-time health check on app load only (no polling)
  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  // Quota cooldown timer — counts down 60s after 429 hit
  useEffect(() => {
    if (quotaExhausted && quotaCooldownSeconds > 0) {
      quotaTimerRef.current = setInterval(() => {
        setQuotaCooldownSeconds(prev => {
          if (prev <= 1) {
            setQuotaExhausted(false);
            if (quotaTimerRef.current) clearInterval(quotaTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (quotaTimerRef.current) clearInterval(quotaTimerRef.current);
      };
    }
  }, [quotaExhausted, quotaCooldownSeconds > 0]);

  // Auto-sync state modifications to LocalStorage
  useEffect(() => {
    localStorage.setItem("flowmind_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("flowmind_habits", JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem("flowmind_schedule", JSON.stringify(scheduleBlocks));
  }, [scheduleBlocks]);

  useEffect(() => {
    if (currentDayPlan) {
      localStorage.setItem("flowmind_day_plan", JSON.stringify(currentDayPlan));
    } else {
      localStorage.removeItem("flowmind_day_plan");
    }
  }, [currentDayPlan]);

  useEffect(() => {
    localStorage.setItem("flowmind_achievements", JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem("flowmind_xp", xp.toString());
    // Auto Level calculation: 500 XP intervals per level
    const calculatedLevel = Math.floor(xp / 500) + 1;
    if (calculatedLevel > level) {
      setLevel(calculatedLevel);
      setUnlockedLevel(calculatedLevel);
      setShowLevelUpModal(true);
      // Auto unlock Flow State Master or Zen Warrior badges when high level is achieved
      unlockBadge("ach-3");
    }
  }, [xp, level]);

  useEffect(() => {
    localStorage.setItem("flowmind_level", level.toString());
  }, [level]);

  useEffect(() => {
    localStorage.setItem("flowmind_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("flowmind_insights", JSON.stringify(insights));
  }, [insights]);

  // Unlock badges helper
  const unlockBadge = (id: string) => {
    setAchievements(prev => {
      let isUnlocked = false;
      const updated = prev.map(ach => {
        if (ach.id === id && !ach.unlocked) {
          isUnlocked = true;
          // Trigger dynamic achievement unlocked toast
          triggerToast(`ACHIEVEMENT UNLOCKED: ${ach.title} (+${ach.xpAwarded} XP)`, "achievement", ach.xpAwarded);
          // Add reward XP safely in next tick
          setTimeout(() => {
            handleAddXp(ach.xpAwarded, `Unlocked badge: ${ach.title}`);
          }, 350);
          return { ...ach, unlocked: true, unlockedAt: new Date().toISOString() };
        }
        return ach;
      });
      return updated;
    });
  };

  // Onboarding & Demo Workspace Handlers
  const handleEnterWorkspace = (onboardingData: OnboardingData) => {
    setOnboarding(onboardingData);
    localStorage.setItem("flowmind_onboarding", JSON.stringify(onboardingData));
    localStorage.setItem("flowmind_entered_workspace", "true");
    localStorage.setItem("flowmind_is_demo", "false");
    setIsDemoActive(false);
    
    // Auto align usersettings start/end hours
    setSettings(prev => ({
      ...prev,
      workHoursStart: onboardingData.workHoursStart,
      workHoursEnd: onboardingData.workHoursEnd
    }));
    
    setShowLanding(false);
  };

  const handleLoadDemoWorkspace = () => {
    const demo = getDemoWorkspaceData();
    
    // Bulk load states
    setTasks(demo.tasks);
    setHabits(demo.habits);
    setScheduleBlocks(demo.scheduleBlocks);
    setAchievements(demo.achievements);
    setInsights(demo.insights);
    setXp(demo.xp);
    setLevel(demo.level);
    setOnboarding(demo.onboarding);
    setIsDemoActive(true);
    
    // Persist to local storage
    localStorage.setItem("flowmind_tasks", JSON.stringify(demo.tasks));
    localStorage.setItem("flowmind_habits", JSON.stringify(demo.habits));
    localStorage.setItem("flowmind_schedule", JSON.stringify(demo.scheduleBlocks));
    localStorage.setItem("flowmind_achievements", JSON.stringify(demo.achievements));
    localStorage.setItem("flowmind_insights", JSON.stringify(demo.insights));
    localStorage.setItem("flowmind_xp", demo.xp.toString());
    localStorage.setItem("flowmind_level", demo.level.toString());
    localStorage.setItem("flowmind_onboarding", JSON.stringify(demo.onboarding));
    localStorage.setItem("flowmind_coach_messages", JSON.stringify(demo.coachMessages));
    localStorage.setItem("flowmind_entered_workspace", "true");
    localStorage.setItem("flowmind_is_demo", "true");

    // Align settings hours too
    setSettings(prev => ({
      ...prev,
      workHoursStart: demo.onboarding.workHoursStart,
      workHoursEnd: demo.onboarding.workHoursEnd
    }));

    setShowLanding(false);
    triggerToast("Demo Workspace synced! Rank 3 authorized.", "level", 1450);
  };

  // State Handler Methods
  const handleAddTask = (taskData: Partial<Task>) => {
    const titleClean = (taskData.title || "Untitled Task").trim();
    // Prevent duplicate tasks (same title, category and dueDate)
    const exists = tasks.some(
      t => t.title.toLowerCase().trim() === titleClean.toLowerCase() &&
           t.dueDate === (taskData.dueDate || new Date().toISOString().split("T")[0])
    );
    if (exists) {
      alert(`A task with the title "${titleClean}" already exists for this due date.`);
      return;
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: titleClean,
      description: taskData.description || "",
      priority: taskData.priority || "medium",
      category: taskData.category || "General",
      dueDate: taskData.dueDate || new Date().toISOString().split("T")[0],
      dueTime: taskData.dueTime || "12:00",
      duration: taskData.duration || 30,
      completed: false,
      procrastinationCount: 0,
      createdDate: new Date().toISOString().split("T")[0],
      subtasks: taskData.subtasks || [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setTasks(prev => [newTask, ...prev]);
    // Reward for allocating tasks
    handleAddXp(15, `Allocated new task: ${newTask.title} (+15 XP)`);
  };

  const handleEditTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const merged = { ...task, ...updates, updatedAt: Date.now() };
        // If task completed now, reward points!
        if (updates.completed === true && !task.completed) {
          let earnedXp = 50; // Base task completed XP
          let xpReason = `Completed task: ${task.title} (+50 XP)`;

          // 1. High-priority bonus
          if (task.priority === "high") {
            earnedXp += 25;
            xpReason += ` + High-Priority Bonus (+25 XP)`;
          }

          // 2. Procrastination recovery bonus
          if (task.procrastinationCount > 0) {
            const recoveryBonus = task.procrastinationCount * 20; // 20 XP per delay index!
            earnedXp += recoveryBonus;
            xpReason += ` + Recovery Bonus (+${recoveryBonus} XP)`;
            
            // Check quantum recovery badge
            unlockBadge("ach-recovery-streak");
            if (task.procrastinationCount >= 3) {
              unlockBadge("ach-2"); // Original Procrastination Slayer
            }
          } else {
            // Check no procrastination badge if this completes the alignment
            const remainingUncompleted = tasks.filter(t => t.id !== id && !t.completed);
            if (remainingUncompleted.length > 0 && remainingUncompleted.every(t => t.procrastinationCount === 0)) {
              unlockBadge("ach-no-procrastinate");
            }
          }

          handleAddXp(earnedXp, xpReason);
          unlockBadge("ach-first-task"); // First Task Completed

          // Daily productivity milestones: completing 3 tasks on the same calendar day
          const todayStr = new Date().toISOString().split("T")[0];
          const completedToday = tasks.filter(t => t.completed && t.dueDate === todayStr && t.id !== id).length + 1; // including current
          if (completedToday >= 3 && lastMilestoneDate !== todayStr) {
            setLastMilestoneDate(todayStr);
            handleAddXp(100, "DAILY MILESTONE CLEARED: Completed 3 task nodes today! (+100 XP)");
          }
        }
        return merged;
      }
      return task;
    }));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleResetTasks = () => {
    const freshTasks = initialTasks.map(task => ({
      ...task,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }));
    setTasks(freshTasks);
    // Sync schedule back to starting blocks to maintain consistency
    setScheduleBlocks(initialScheduleBlocks);
  };

  const handleAddHabit = (habitData: Partial<Habit>) => {
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      title: habitData.title || "New Habit Loop",
      streak: 0,
      maxStreak: 0,
      completedDates: [],
      frequency: habitData.frequency || "daily",
      category: habitData.category || "General",
      xpValue: habitData.xpValue || 15
    };
    setHabits(prev => [...prev, newHabit]);
    handleAddXp(25, `Registered new habit loop: ${newHabit.title} (+25 XP)`);
  };

  const handleToggleHabitDate = (habitId: string, dateStr: string) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const alreadyCompleted = habit.completedDates.includes(dateStr);
        let updatedDates;
        if (alreadyCompleted) {
          updatedDates = habit.completedDates.filter(d => d !== dateStr);
        } else {
          updatedDates = [...habit.completedDates, dateStr];
          
          // REWARD CALCULATION: Streak Loop
          let currentStreak = 0;
          let checkDate = new Date();
          while (true) {
            const dateCheckStr = checkDate.toISOString().split("T")[0];
            if (updatedDates.includes(dateCheckStr)) {
              currentStreak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }
          
          const streakMultiplier = Math.min(5, Math.floor(currentStreak / 3)); // Capped at 5x multiplier
          const streakBonus = streakMultiplier * 10;
          const totalEarned = habit.xpValue + streakBonus;
          
          handleAddXp(totalEarned, `Habit Loop resolved: ${habit.title} (+${habit.xpValue} XP, Streak Bonus: +${streakBonus} XP)`);
          
          // Check achievements
          if (currentStreak >= 7) {
            unlockBadge("ach-habit-streak");
          }
        }

        // Recalculate streak loop for general state persistence
        let currentStreak = 0;
        let checkDate = new Date();
        while (true) {
          const dateCheckStr = checkDate.toISOString().split("T")[0];
          if (updatedDates.includes(dateCheckStr)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            // Check if they completed yesterday to sustain streak
            if (currentStreak === 0) {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = yesterday.toISOString().split("T")[0];
              if (updatedDates.includes(yesterdayStr)) {
                // Yesterday was completed, so streak is maintained through yesterday
                let yesterdayStreak = 0;
                let yCheckDate = yesterday;
                while (true) {
                  const yCheckStr = yCheckDate.toISOString().split("T")[0];
                  if (updatedDates.includes(yCheckStr)) {
                    yesterdayStreak++;
                    yCheckDate.setDate(yCheckDate.getDate() - 1);
                  } else {
                    break;
                  }
                }
                currentStreak = yesterdayStreak;
              }
            }
            break;
          }
        }

        const maxStreak = Math.max(habit.maxStreak, currentStreak);
        
        return {
          ...habit,
          completedDates: updatedDates,
          streak: currentStreak,
          maxStreak
        };
      }
      return habit;
    }));
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const handleAddXp = (amount: number, reason?: string) => {
    setXp(prev => prev + amount);
    triggerToast(reason || `Synthesized neuro-energy (+${amount} XP)`, "xp", amount);
  };

  const handleLogFocusSession = (minutes: number) => {
    unlockBadge("ach-focus-deep"); // Deep Focus Session badge
    if (minutes >= 90) {
      unlockBadge("ach-3"); // Original Flow State Master
    }
  };

  const handleUpdateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  // ==================================================
  // 🧠 CORE AI FULL-STACK ENDPOINT INTEGRATIONS
  // ==================================================

  // 1. CHATBOT BOT SENDER GATEWAY
  const handleSendMessageToAI = async (contents: any[], systemInstruction?: string, onRetry?: (attempt: number, errorMsg: string) => void) => {
    try {
      const response = await fetchWithRetry("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents, systemInstruction })
      }, 1, onRetry);
      if (!response.ok) {
        const err = await response.json();
        const errorMsg = err.error || "Failed to communicate with AI Coach.";
        
        // 429 quota error — activate quota protection, do NOT mark offline
        if (response.status === 429 || isQuotaError(errorMsg)) {
          setQuotaExhausted(true);
          setQuotaCooldownSeconds(60);
          throw new Error(errorMsg);
        }
        throw new Error(errorMsg);
      }
      const data = await response.json();
      // Successful response: restore live status
      setIsCoachLive(true);
      return data.text || "Diagnostic synapsing yielded empty payload.";
    } catch (err: any) {
      const errorMsg = err.message || "";
      // Only mark coach offline for network/server unreachable errors
      // Do NOT mark offline for quota exhaustion (429)
      if (!isQuotaError(errorMsg)) {
        setIsCoachLive(false);
      }
      throw err;
    }
  };

  // 2. TRIGGER AI DIAGNOSTIC INSIGHTS
  const handleTriggerAIDiagnostics = async () => {
    setIsGeneratingDiagnostics(true);
    try {
      const activeTasks = tasks.filter(t => !t.completed);
      const completedTasksCount = tasks.filter(t => t.completed).length;

      const response = await fetchWithRetry("/api/gemini/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completedTasksCount,
          pendingTasksCount: activeTasks.length,
          stats: {
            focusHours: Math.round((completedTasksCount * 1.5) + 3),
            pomoSessions: Math.round(completedTasksCount * 2),
            habitStreak: habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0,
            xp
          }
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Synchronization failure on AI diagnostics endpoint.");
      }
      const updatedInsights: AIInsights = await response.json();

      setInsights(updatedInsights);
      handleAddXp(40);
      alert("AI Calibration complete! Check your updated Diagnostics Workspace.");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred compiling insights.");
    } finally {
      setIsGeneratingDiagnostics(false);
    }
  };

  // 3. TRIGGER TASK PRIORITIZE VECTOR
  const handleTriggerTaskPrioritize = async (id: string) => {
    setIsPrioritizingTask(id);
    try {
      const targetTask = tasks.find(t => t.id === id);
      if (!targetTask) return;

      const response = await fetchWithRetry("/api/gemini/prioritize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: [targetTask],
          mood
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to query AI Prioritizer endpoint.");
      }
      const data = await response.json();
      const updatedInfo = data.prioritizedTasks?.[0];

      if (updatedInfo) {
        setTasks(prev => prev.map(t => {
          if (t.id === id) {
            return {
              ...t,
              aiPriorityScore: updatedInfo.priorityScore,
              aiRiskLevel: updatedInfo.riskLevel,
              aiRiskPercentage: updatedInfo.riskPercentage,
              aiRiskReason: updatedInfo.riskReason,
              aiCorrectiveAction: updatedInfo.correctiveAction,
              aiDynamicWorkload: updatedInfo.dynamicWorkload,
              aiAdjustedDuration: updatedInfo.adjustedDuration,
              aiReasoning: updatedInfo.dynamicReasoning
            };
          }
          return t;
        }));
        handleAddXp(30);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Could not prioritize task.");
    } finally {
      setIsPrioritizingTask(null);
    }
  };

  // 4. TRIGGER SMART GOAL BREAKDOWN
  const handleTriggerGoalBreakdown = async (id: string) => {
    setIsBreakingDownTask(id);
    try {
      const targetTask = tasks.find(t => t.id === id);
      if (!targetTask) return;

      const response = await fetchWithRetry("/api/gemini/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: targetTask.title,
          description: targetTask.description
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Breakdown endpoint returned failure.");
      }
      const data = await response.json();
      const generatedSubs = data.subtasks;

      if (generatedSubs && Array.isArray(generatedSubs)) {
        const mappedSubs = generatedSubs.map((sub: any, idx: number) => ({
          id: `sub-${id}-${idx}-${Date.now()}`,
          title: sub.title,
          completed: false,
          durationMin: sub.durationMin
        }));

        setTasks(prev => prev.map(t => {
          if (t.id === id) {
            return {
              ...t,
              subtasks: [...t.subtasks, ...mappedSubs]
            };
          }
          return t;
        }));
        handleAddXp(30);
        alert(`Successfully deconstructed goal. ${mappedSubs.length} subtask nodes appended.`);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Goal deconstruction aborted.");
    } finally {
      setIsBreakingDownTask(null);
    }
  };

  // 5. TRIGGER AI TIMELINE DAY PLANNER
  const handleTriggerAIPlan = async (breakPref: string, stress: string, focusCons: string) => {
    setIsGeneratingPlan(true);
    try {
      const activeTasks = tasks.filter(t => !t.completed);
      const response = await fetchWithRetry("/api/gemini/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: activeTasks,
          mood,
          workHoursStart: settings.workHoursStart,
          workHoursEnd: settings.workHoursEnd,
          breakPreference: breakPref,
          stressLevel: stress,
          focusConsistency: focusCons
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Planner allocation server error.");
      }
      const data = await response.json();
      
      if (data && data.schedule && Array.isArray(data.schedule)) {
        const newPlan: DayPlan = {
          id: `plan-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          schedule: data.schedule,
          burnoutRisk: data.burnoutRisk || "medium",
          burnoutWarning: data.burnoutWarning || "",
          confidenceEstimate: data.confidenceEstimate ?? 80,
          workloadDensity: data.workloadDensity ?? 50,
          whyPrioritized: data.whyPrioritized || "",
          whyRecovery: data.whyRecovery || "",
          tactics: data.tactics || [],
          completionProbability: data.completionProbability || []
        };
        
        setCurrentDayPlan(newPlan);
        setScheduleBlocks(data.schedule);
        handleAddXp(50, "Synthesized customized daily timeline (+50 XP)");
        unlockBadge("ach-1");
        triggerToast("AI Timeline aligned & loaded!", "streak", 50);
      }
    } catch (err: any) {
      console.error(err);
      triggerToast("AI Scheduling alignment failed.", "xp", 0);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // 6. AUTONOMOUS RESCHEDULING
  const handleMoveIncompleteTasks = () => {
    // Scanning for active tasks and assigning them to existing buffer slots or adding alerts
    const incompleteTasksList = tasks.filter(t => !t.completed);
    if (incompleteTasksList.length === 0) {
      alert("All task nodes resolved. Autonomous cushion scheduling is at absolute peak.");
      return;
    }

    // Auto-map incomplete items into schedule blocks that are labeled as 'buffer' or 'break' to save time!
    let updatedBlocks = [...scheduleBlocks];
    let allocatedCount = 0;

    updatedBlocks = updatedBlocks.map(block => {
      if (block.type === "buffer" && !block.taskId && allocatedCount < incompleteTasksList.length) {
        const taskToSlot = incompleteTasksList[allocatedCount];
        allocatedCount++;
        return {
          ...block,
          taskId: taskToSlot.id,
          title: `Autonomous Slot: ${taskToSlot.title}`,
          description: `Automatically reassigned due to deadline risk indicators. Action: ${taskToSlot.aiCorrectiveAction || "Focus on key subtasks."}`
        };
      }
      return block;
    });

    if (allocatedCount > 0) {
      onUpdateScheduleBlocks(updatedBlocks);
      handleAddXp(25);
      alert(`Autonomous Rescheduling active. Shifted ${allocatedCount} incomplete task deliverables into open adaptive buffer slots.`);
    } else {
      alert("No vacant buffer slots detected in current schedule. Click 'AI Generate Day Plan' to calibrate fresh timeline nodes.");
    }
  };

  const onUpdateScheduleBlocks = (blocks: ScheduleBlock[]) => {
    setScheduleBlocks(blocks);
    if (currentDayPlan) {
      setCurrentDayPlan(prev => prev ? { ...prev, schedule: blocks } : null);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {showLanding ? (
        <motion.div
          key="landing-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-full h-full"
        >
          <LandingPage 
            onEnterWorkspace={handleEnterWorkspace}
            onLoadDemoWorkspace={handleLoadDemoWorkspace}
            hasWorkspace={!!onboarding}
            onReturnToWorkspace={() => setShowLanding(false)}
            isDemoActive={isDemoActive}
          />
        </motion.div>
      ) : (
        <motion.div
          key="workspace-view"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-screen h-screen flex bg-[#050507] text-white/95 overflow-hidden font-sans"
        >
          
          {/* Dynamic Sidebar */}
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            xp={xp} 
            level={level} 
            onReturnToLanding={() => setShowLanding(true)}
            isCoachLive={isCoachLive}
          />

      {/* Main viewport Container */}
      <main className="flex-1 h-full flex flex-col relative overflow-hidden">
        
        {/* Network Offline Banner */}
        {!isOnline && (
          <div className="bg-rose-500/10 border-b border-rose-500/20 p-3 px-6 flex items-center justify-between animate-pulse shrink-0 z-10">
            <div className="flex items-center gap-3">
              <WifiOff className="w-4 h-4 text-rose-400 animate-bounce" />
              <p className="text-xs text-rose-300 font-mono">
                <strong>OFFLINE ACTIVE</strong> — Cognitive link desynchronized. Offline caching active. FlowMind will resume transmission upon reconnection.
              </p>
            </div>
            <span className="text-[9px] bg-rose-500/20 text-rose-400 px-2.5 py-0.5 rounded font-mono font-black uppercase">Buffered</span>
          </div>
        )}
        
        {activeTab === "dashboard" && (
          <Dashboard
            tasks={tasks}
            habits={habits}
            achievements={achievements}
            insights={insights}
            mood={mood}
            setMood={setMood}
            xp={xp}
            level={level}
            triggerAIDiagnostics={handleTriggerAIDiagnostics}
            isGeneratingDiagnostics={isGeneratingDiagnostics}
            onToggleTask={(id) => handleEditTask(id, { completed: true })}
          />
        )}

        {activeTab === "tasks" && (
          <TaskManager
            tasks={tasks}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onTriggerPrioritize={handleTriggerTaskPrioritize}
            isPrioritizingTask={isPrioritizingTask}
            onTriggerGoalBreakdown={handleTriggerGoalBreakdown}
            isBreakingDownTask={isBreakingDownTask}
            onResetTasks={handleResetTasks}
          />
        )}

        {activeTab === "planner" && (
          <Planner
            tasks={tasks}
            scheduleBlocks={scheduleBlocks}
            mood={mood}
            setMood={setMood}
            workHoursStart={settings.workHoursStart}
            workHoursEnd={settings.workHoursEnd}
            onGenerateAIPlan={handleTriggerAIPlan}
            isGeneratingPlan={isGeneratingPlan}
            onUpdateScheduleBlocks={onUpdateScheduleBlocks}
            onMoveIncompleteTasks={handleMoveIncompleteTasks}
            currentDayPlan={currentDayPlan}
          />
        )}

        {activeTab === "focus" && (
          <FocusMode
            pomoDuration={settings.pomoDuration}
            shortBreakDuration={settings.shortBreakDuration}
            onAddXp={handleAddXp}
            onLogFocusSession={handleLogFocusSession}
          />
        )}

        {activeTab === "habits" && (
          <HabitsTracker
            habits={habits}
            onAddHabit={handleAddHabit}
            onToggleHabitDate={handleToggleHabitDate}
            onDeleteHabit={handleDeleteHabit}
            xp={xp}
          />
        )}

        {activeTab === "coach" && (
          <AICoach
            onSendMessage={handleSendMessageToAI}
            tasksContext={tasks.filter(t => !t.completed).map(t => ({ title: t.title, priority: t.priority, procrastinationCount: t.procrastinationCount }))}
            habitsContext={habits.map(h => ({ title: h.title, streak: h.streak }))}
            isOnline={isOnline}
            quotaExhausted={quotaExhausted}
            quotaCooldownSeconds={quotaCooldownSeconds}
          />
        )}

        {activeTab === "settings" && (
          <Settings
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </main>

      {/* GAMIFICATION LEVEL UP MODAL */}
      {showLevelUpModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in select-none">
          <div className="bg-[#0b101c] border-2 border-yellow-500/40 p-8 rounded-3xl max-w-sm text-center space-y-6 relative overflow-hidden shadow-2xl">
            {/* Ambient neon */}
            <div className="absolute top-[-50px] left-[-50px] w-32 h-32 rounded-full bg-yellow-400/10 blur-[50px] animate-pulse" />

            <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 mx-auto shadow-[0_0_20px_rgba(234,179,8,0.2)] animate-bounce">
              <Award className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">Node Level Up!</h2>
              <p className="text-xs text-slate-400">Your cognitive synchronicity has escalated.</p>
            </div>

            <div className="bg-slate-950/85 py-3.5 px-6 rounded-2xl border border-slate-850">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-black">Authorized Rank</span>
              <strong className="text-3xl font-black text-yellow-400 font-mono block mt-1">Level {unlockedLevel}</strong>
            </div>

            <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
              New neural credentials authorized. Complete deep work blocks to maintain streak multipliers.
            </p>

            <button
              onClick={() => setShowLevelUpModal(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black text-xs font-black font-mono uppercase transition-all shadow-[0_0_15px_rgba(234,179,8,0.15)]"
            >
              Confirm Authorization
            </button>
          </div>
        </div>
      )}

      {/* 🚀 FUTURISTIC TOAST NOTIFICATIONS CENTER */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: 50, scale: 0.95, filter: "blur(2px)" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={`p-4 rounded-xl border backdrop-blur-md shadow-lg flex items-start gap-3 pointer-events-auto ${
                toast.type === "achievement"
                  ? "border-yellow-500/30 bg-yellow-950/40 text-yellow-200 shadow-[0_0_20px_rgba(234,179,8,0.15)]"
                  : toast.type === "level"
                  ? "border-purple-500/30 bg-purple-950/40 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                  : toast.type === "streak"
                  ? "border-amber-500/30 bg-amber-950/40 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                  : "border-cyan-500/30 bg-cyan-950/40 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
              }`}
            >
              <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 mt-0.5">
                {toast.type === "achievement" ? (
                  <Award className="w-4 h-4 text-yellow-400 animate-bounce" />
                ) : toast.type === "level" ? (
                  <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                ) : (
                  <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold font-mono tracking-wide leading-tight uppercase">
                  {toast.type === "achievement" ? "Neural Achievement unlocked" : toast.type === "level" ? "authorized clearance" : "biometric update"}
                </p>
                <p className="text-xs text-white/90 font-sans mt-0.5">{toast.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
