import { Task, Habit, ScheduleBlock, Achievement, UserSettings, AIInsights } from "./types";

export const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Pitch Deck Refinement for Demo Day",
    description: "Align core financials, revise the user acquisition slide, and practice the 3-minute flow.",
    priority: "high",
    category: "Strategic Planning",
    dueDate: new Date().toISOString().split("T")[0], // Today
    dueTime: "18:00",
    duration: 90,
    completed: false,
    procrastinationCount: 3,
    createdDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    subtasks: [
      { id: "sub-1-1", title: "Update CAGR projections", completed: true },
      { id: "sub-1-2", title: "Polish layout graphics", completed: false },
      { id: "sub-1-3", title: "Record 3m practice voiceover", completed: false }
    ],
    aiPriorityScore: 94,
    aiRiskLevel: "high",
    aiRiskPercentage: 85,
    aiRiskReason: "High procrastination count (3 times delayed) paired with an impending 18:00 deadline.",
    aiCorrectiveAction: "Launch Pomodoro immediately. Complete 'Update CAGR projections' as a quick micro-action.",
    aiDynamicWorkload: 8,
    aiAdjustedDuration: 105,
    aiReasoning: "Urgency is high. Since you are stressed, we expanded task duration slightly to accommodate mental friction."
  },
  {
    id: "task-2",
    title: "Implement API Ingress Validation",
    description: "Integrate Zod schema middleware for payload validation inside server handlers.",
    priority: "high",
    category: "Development",
    dueDate: new Date().toISOString().split("T")[0], // Today
    dueTime: "14:00",
    duration: 60,
    completed: true,
    procrastinationCount: 0,
    createdDate: new Date().toISOString().split("T")[0],
    subtasks: [
      { id: "sub-2-1", title: "Write express validation middleware", completed: true },
      { id: "sub-2-2", title: "Add unit tests for error boundaries", completed: true }
    ],
    aiPriorityScore: 80,
    aiRiskLevel: "low",
    aiRiskPercentage: 10,
    aiRiskReason: "Task completed successfully ahead of scheduled time.",
    aiCorrectiveAction: "None required. Celebrate this win!",
    aiDynamicWorkload: 6,
    aiAdjustedDuration: 60,
    aiReasoning: "Optimal completion. High productivity alignment."
  },
  {
    id: "task-3",
    title: "Prepare Q3 Marketing Roadmap",
    description: "Outline budget allocations across social media, SEO optimization, and conference sponsorships.",
    priority: "medium",
    category: "Marketing",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // In 2 days
    dueTime: "17:00",
    duration: 120,
    completed: false,
    procrastinationCount: 1,
    createdDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    subtasks: [
      { id: "sub-3-1", title: "Perform influencer ROI audit", completed: false },
      { id: "sub-3-2", title: "Draft budget spreadsheet layout", completed: false }
    ],
    aiPriorityScore: 65,
    aiRiskLevel: "medium",
    aiRiskPercentage: 45,
    aiRiskReason: "Moderate buffer time remaining, but a prior postponement indicates potential friction.",
    aiCorrectiveAction: "Draft the skeleton roadmap for 20 minutes to break procrastination loop.",
    aiDynamicWorkload: 5,
    aiAdjustedDuration: 120,
    aiReasoning: "Prioritizing strategic blocks early prevents last-minute panic."
  },
  {
    id: "task-4",
    title: "Design Landing Page Hero Section",
    description: "Build three gorgeous glassmorphic components in Figma with neon gradients and bold headers.",
    priority: "low",
    category: "Design",
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // In 4 days
    dueTime: "12:00",
    duration: 180,
    completed: false,
    procrastinationCount: 0,
    createdDate: new Date().toISOString().split("T")[0],
    subtasks: [
      { id: "sub-4-1", title: "Select color palette and typography scale", completed: true },
      { id: "sub-4-2", title: "Generate 3D glass renders", completed: false },
      { id: "sub-4-3", title: "Draft high-fidelity layout options", completed: false }
    ],
    aiPriorityScore: 42,
    aiRiskLevel: "low",
    aiRiskPercentage: 15,
    aiRiskReason: "Generous deadline and early subtask progress minimize risk.",
    aiCorrectiveAction: "Perfect task for a 'creative' flow state. Schedule for tomorrow afternoon.",
    aiDynamicWorkload: 4,
    aiAdjustedDuration: 180,
    aiReasoning: "Highly aligned with creative moods."
  }
];

export const initialHabits: Habit[] = [
  {
    id: "habit-1",
    title: "Morning Planning Block",
    streak: 6,
    maxStreak: 12,
    completedDates: [
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    ],
    frequency: "daily",
    category: "Productivity",
    xpValue: 15
  },
  {
    id: "habit-2",
    title: "Deep Work Blocks (90m)",
    streak: 3,
    maxStreak: 5,
    completedDates: [
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    ],
    frequency: "daily",
    category: "Focus",
    xpValue: 25
  },
  {
    id: "habit-3",
    title: "Mindfulness & Breathing Rest",
    streak: 0,
    maxStreak: 4,
    completedDates: [],
    frequency: "daily",
    category: "Well-being",
    xpValue: 20
  }
];

export const initialScheduleBlocks: ScheduleBlock[] = [
  {
    title: "Futuristic Planning & Ambient Sync",
    startTime: "09:00",
    endTime: "09:30",
    type: "routine",
    description: "Align today's vision, calibrate mood vectors, and sync with the core engine."
  },
  {
    taskId: "task-1",
    title: "Deep Work: Pitch Deck Refinement",
    startTime: "09:30",
    endTime: "11:15",
    type: "work",
    description: "Laser focus. No notifications. Work through financial slides and deck flow."
  },
  {
    title: "Mental Decompression & Hydration",
    startTime: "11:15",
    endTime: "11:30",
    type: "break",
    description: "Somatic breathing. Walk outside. Give your sensory nodes a full reset."
  },
  {
    taskId: "task-3",
    title: "Collaborative Sync: Preparing Q3 Roadmaps",
    startTime: "11:30",
    endTime: "13:00",
    type: "work",
    description: "Synthesize budget metrics and structure cross-channel ROI figures."
  },
  {
    title: "Lunch & Cognitive Defraction",
    startTime: "13:00",
    endTime: "14:00",
    type: "break",
    description: "Nutrient refueling and offline rest. Do not check emails."
  },
  {
    taskId: "task-2",
    title: "Engineering: Implement API Ingress Validation",
    startTime: "14:00",
    endTime: "15:00",
    type: "work",
    description: "Compile Zod routers and verify validation boundaries."
  },
  {
    title: "Unscheduled Adaptive Buffer Block",
    startTime: "15:00",
    endTime: "15:45",
    type: "buffer",
    description: "AI-reserved slot for delayed tasks, slack messages, or emergency updates."
  }
];

export const initialAchievements: Achievement[] = [
  {
    id: "ach-1",
    title: "Neural Synergy",
    description: "Complete your first AI-prioritized task schedule successfully.",
    iconName: "Zap",
    xpAwarded: 50,
    unlocked: true,
    unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "ach-2",
    title: "Procrastination Slayer",
    description: "Complete a task that has been rescheduled or delayed 3+ times.",
    iconName: "ShieldCheck",
    xpAwarded: 100,
    unlocked: false
  },
  {
    id: "ach-3",
    title: "Flow State Master",
    description: "Log a continuous 90-minute Pomodoro/Focus deep work session.",
    iconName: "Flame",
    xpAwarded: 150,
    unlocked: true,
    unlockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "ach-4",
    title: "Zen Warrior",
    description: "Keep a habit active during a 'Stressed' mood day.",
    iconName: "Compass",
    xpAwarded: 80,
    unlocked: false
  },
  {
    id: "ach-first-task",
    title: "First Breakthrough",
    description: "Complete your first objective to initialize task clearance biometrics.",
    iconName: "CheckCircle2",
    xpAwarded: 40,
    unlocked: false
  },
  {
    id: "ach-habit-7",
    title: "Momentum Anchor",
    description: "Maintain a 7-day habit loop streak for maximum neural consistency.",
    iconName: "Flame",
    xpAwarded: 100,
    unlocked: false
  },
  {
    id: "ach-focus-deep",
    title: "Chronos Focus",
    description: "Complete a Pomodoro focus sprint block without active interruptions.",
    iconName: "Clock",
    xpAwarded: 60,
    unlocked: false
  },
  {
    id: "ach-no-procrastinate",
    title: "Perfect Alignment",
    description: "Complete all active task deliverables with 0 procrastination/delays registered.",
    iconName: "ShieldCheck",
    xpAwarded: 80,
    unlocked: false
  },
  {
    id: "ach-recovery-streak",
    title: "Quantum Recovery",
    description: "Dismantle high friction delay cycles by resolving a heavily postponed task.",
    iconName: "TrendingUp",
    xpAwarded: 120,
    unlocked: false
  },
  {
    id: "ach-ai-plan-expert",
    title: "AI Planning Expert",
    description: "Generate a fully aligned AI scheduling model to structure your productivity workspace.",
    iconName: "Sparkles",
    xpAwarded: 90,
    unlocked: false
  }
];

export const defaultSettings: UserSettings = {
  geminiApiKey: "",
  workHoursStart: "09:00",
  workHoursEnd: "17:00",
  pomoDuration: 25,
  shortBreakDuration: 5,
  soundEnabled: true,
  notificationsEnabled: true,
  theme: "dark"
};

export const initialInsights: AIInsights = {
  productivityScore: 82,
  focusScore: 78,
  weeklyAnalysis: "You are exhibiting phenomenal development velocity, but high deadline risks are materializing on your 'Strategic Planning' tasks. Procrastination clusters are forming on tasks with high cognitive load. Your focus duration peaked during mid-afternoon hours.",
  burnoutWarning: "MODERATE RISK: Procrastination counts on creative/strategic items coupled with high focus sprints suggest potential cognitive depletion. Leverage the AI-reserved buffer blocks to rest.",
  performanceInsights: [
    "Your streak consistency is highest (85%) in the 'Productivity' category.",
    "Procrastination occurs 3x more frequently on tasks scheduled after 16:00.",
    "Taking structured 15-minute hydration breaks increased focus durability by 22%.",
    "Mood shifts toward 'tired' correlated with an average 40-minute delay in complex items."
  ]
};
