export type Priority = "low" | "medium" | "high";

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  durationMin?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: string;
  dueDate: string;
  dueTime: string;
  duration: number; // in minutes
  completed: boolean;
  procrastinationCount: number; // times delayed/postponed
  createdDate: string;
  subtasks: SubTask[];
  createdAt?: number;
  updatedAt?: number;
  
  // AI-augmented fields
  aiPriorityScore?: number;
  aiRiskLevel?: "low" | "medium" | "high";
  aiRiskPercentage?: number;
  aiRiskReason?: string;
  aiCorrectiveAction?: string;
  aiDynamicWorkload?: number; // 1-10
  aiAdjustedDuration?: number;
  aiReasoning?: string;
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  maxStreak: number;
  completedDates: string[]; // YYYY-MM-DD
  frequency: "daily" | "weekly";
  category: string;
  xpValue: number;
}

export interface ScheduleBlock {
  id?: string;
  taskId?: string | null;
  title: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  type: "work" | "break" | "buffer" | "routine";
  description: string;
  focusIntensity?: number; // 1 to 5, where 5 is high focus (deep work) and 1 is passive/break
}

export interface DayPlan {
  id: string;
  date: string; // YYYY-MM-DD
  schedule: ScheduleBlock[];
  burnoutRisk: "low" | "medium" | "high";
  burnoutWarning: string;
  confidenceEstimate: number; // 0 to 100
  workloadDensity: number; // 0 to 100
  whyPrioritized: string;
  whyRecovery: string;
  tactics: string[];
  completionProbability: { taskId: string; title: string; probability: number }[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  xpAwarded: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export type Mood = "energetic" | "focused" | "creative" | "stressed" | "tired";

export interface UserSettings {
  geminiApiKey: string;
  workHoursStart: string; // HH:MM
  workHoursEnd: string; // HH:MM
  pomoDuration: number; // minutes
  shortBreakDuration: number; // minutes
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  theme: "dark" | "light" | "cyberpunk" | "nebula";
}

export interface AIInsights {
  productivityScore: number;
  focusScore: number;
  weeklyAnalysis: string;
  burnoutWarning: string;
  performanceInsights: string[];
}
