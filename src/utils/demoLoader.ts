import { Task, Habit, ScheduleBlock, Achievement, AIInsights } from "../types";
import { OnboardingData } from "../components/LandingPage";

export interface DemoWorkspaceData {
  tasks: Task[];
  habits: Habit[];
  scheduleBlocks: ScheduleBlock[];
  achievements: Achievement[];
  insights: AIInsights;
  xp: number;
  level: number;
  onboarding: OnboardingData;
  coachMessages: any[];
}

export function getDemoWorkspaceData(): DemoWorkspaceData {
  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const dayBeforeYesterdayStr = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const threeDaysAgoStr = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const fourDaysAgoStr = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const fiveDaysAgoStr = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const onboarding: OnboardingData = {
    name: "Judge",
    workType: "Productivity Judge",
    struggle: "Burnout & Stress",
    workHoursStart: "09:00",
    workHoursEnd: "17:00"
  };

  const tasks: Task[] = [
    {
      id: "demo-task-1",
      title: "Strategic Q3 Product Roadmap Alignment",
      description: "Define core product delivery tracks, align with stakeholder budgets, and prepare high-fidelity slides for the executive review.",
      priority: "high",
      category: "Strategic Planning",
      dueDate: todayStr,
      dueTime: "18:00",
      duration: 120,
      completed: false,
      procrastinationCount: 3,
      createdDate: threeDaysAgoStr,
      subtasks: [
        { id: "demo-sub-1-1", title: "Complete stakeholder budget assessment spreadsheet", completed: true },
        { id: "demo-sub-1-2", title: "Refine slide templates with high-contrast visual themes", completed: false },
        { id: "demo-sub-1-3", title: "Schedule 15m review dry-run with product directors", completed: false }
      ],
      aiPriorityScore: 95,
      aiRiskLevel: "high",
      aiRiskPercentage: 88,
      aiRiskReason: "High procrastination count (3 delays registered) coupled with an impending 18:00 evening deadline.",
      aiCorrectiveAction: "Schedule a 25-minute Pomodoro block immediately. Complete 'Refine slide templates' as a low-friction action.",
      aiDynamicWorkload: 8,
      aiAdjustedDuration: 135,
      aiReasoning: "Urgency is critical. Since you reported high stress, we slightly expanded the duration buffer to mitigate start friction."
    },
    {
      id: "demo-task-2",
      title: "Integrate Zod Schema Route Validators",
      description: "Embed TypeScript schemas inside express routing middleware to ensure payload validation at API ingress borders.",
      priority: "high",
      category: "Development",
      dueDate: todayStr,
      dueTime: "14:00",
      duration: 60,
      completed: true,
      procrastinationCount: 0,
      createdDate: todayStr,
      subtasks: [
        { id: "demo-sub-2-1", title: "Write ingress validation routers for product items", completed: true },
        { id: "demo-sub-2-2", title: "Draft unit tests verifying error status boundaries", completed: true }
      ],
      aiPriorityScore: 82,
      aiRiskLevel: "low",
      aiRiskPercentage: 5,
      aiRiskReason: "Task successfully finalized before the scheduled time limit.",
      aiCorrectiveAction: "None required. Outstanding focus velocity!",
      aiDynamicWorkload: 6,
      aiAdjustedDuration: 60,
      aiReasoning: "Finalized under peak energetic energy levels. No backlog risk detected."
    },
    {
      id: "demo-task-3",
      title: "Audit Figma High-Contrast Designs",
      description: "Optimize layout margins, verify font typography pairings, and test responsive grid behavior across mobile devices.",
      priority: "medium",
      category: "Design",
      dueDate: todayStr,
      dueTime: "16:30",
      duration: 90,
      completed: false,
      procrastinationCount: 1,
      createdDate: yesterdayStr,
      subtasks: [
        { id: "demo-sub-3-1", title: "Standardize typography token sizes inside active library", completed: true },
        { id: "demo-sub-3-2", title: "Verify responsive flexbox behavior on 375px viewports", completed: false }
      ],
      aiPriorityScore: 71,
      aiRiskLevel: "medium",
      aiRiskPercentage: 42,
      aiRiskReason: "Moderate remaining buffer time, but a single delay indicates starting friction.",
      aiCorrectiveAction: "Open Figma for just 10 minutes to review tokens and break initial focus resistance.",
      aiDynamicWorkload: 5,
      aiAdjustedDuration: 90,
      aiReasoning: "Highly creative design task, well-suited for a late morning focus slot."
    },
    {
      id: "demo-task-4",
      title: "Draft Q3 Marketing Outreach Budget",
      description: "Detail marketing cost frameworks across SEO optimization partners, key conference sponsorships, and newsletter promotions.",
      priority: "low",
      category: "Marketing",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      dueTime: "12:00",
      duration: 90,
      completed: false,
      procrastinationCount: 0,
      createdDate: todayStr,
      subtasks: [
        { id: "demo-sub-4-1", title: "Review historic CAC across active channels", completed: false }
      ],
      aiPriorityScore: 38,
      aiRiskLevel: "low",
      aiRiskPercentage: 12,
      aiRiskReason: "Generous deadline buffer. No backlog or procrastination history detected.",
      aiCorrectiveAction: "Perfect candidate to defer if high-priority tasks run over. Defer to tomorrow.",
      aiDynamicWorkload: 4,
      aiAdjustedDuration: 90,
      aiReasoning: "Low cognitive urgency. Easily schedulable during low-energy slots."
    }
  ];

  const habits: Habit[] = [
    {
      id: "demo-habit-1",
      title: "Morning Backlog Review",
      streak: 11,
      maxStreak: 18,
      completedDates: [todayStr, yesterdayStr, dayBeforeYesterdayStr, threeDaysAgoStr, fourDaysAgoStr, fiveDaysAgoStr],
      frequency: "daily",
      category: "Productivity",
      xpValue: 15
    },
    {
      id: "demo-habit-2",
      title: "Deep Work Blocks (90m)",
      streak: 8,
      maxStreak: 15,
      completedDates: [todayStr, yesterdayStr, dayBeforeYesterdayStr, threeDaysAgoStr, fourDaysAgoStr],
      frequency: "daily",
      category: "Focus",
      xpValue: 25
    },
    {
      id: "demo-habit-3",
      title: "Somatic Breathing Decompression",
      streak: 3,
      maxStreak: 5,
      completedDates: [todayStr, yesterdayStr, dayBeforeYesterdayStr],
      frequency: "daily",
      category: "Well-being",
      xpValue: 20
    }
  ];

  const scheduleBlocks: ScheduleBlock[] = [
    {
      title: "Morning Backlog & Workspace Alignment",
      startTime: "09:00",
      endTime: "09:30",
      type: "routine",
      description: "Review today's goals, calibrate biometric mood logs, and synchronize workspace data.",
      focusIntensity: 2
    },
    {
      taskId: "demo-task-1",
      title: "Deep Work: Q3 Product Roadmap Slide Refinement",
      startTime: "09:30",
      endTime: "11:15",
      type: "work",
      description: "Laser focus. Minimize notification channels. Outline financial metrics and deck sequence.",
      focusIntensity: 5
    },
    {
      title: "Somatic Decompression Break",
      startTime: "11:15",
      endTime: "11:30",
      type: "break",
      description: "Perform structured breathing loops. Move around. Reset your visual fields.",
      focusIntensity: 1
    },
    {
      taskId: "demo-task-3",
      title: "Collaborative Sync: Design Margin Audits",
      startTime: "11:30",
      endTime: "13:00",
      type: "work",
      description: "Coordinate responsive tokens and cross-device grid parameters.",
      focusIntensity: 4
    },
    {
      title: "Cognitive Recovery & Lunch",
      startTime: "13:00",
      endTime: "14:00",
      type: "break",
      description: "Nutrient replenishment and device-free relaxation. Protect mental clarity.",
      focusIntensity: 1
    },
    {
      taskId: "demo-task-2",
      title: "Engineering: Implement API Ingress Validations",
      startTime: "14:00",
      endTime: "15:00",
      type: "work",
      description: "Compile Zod schemas and verify robust error boundaries on endpoint handlers.",
      focusIntensity: 4
    },
    {
      title: "Adaptive Buffer: Emergency backlog adjustments",
      startTime: "15:00",
      endTime: "15:45",
      type: "buffer",
      description: "AI-allocated slot to absorb delayed tasks, answer messages, or manage cognitive fatigue.",
      focusIntensity: 2
    }
  ];

  const achievements: Achievement[] = [
    {
      id: "ach-1",
      title: "Neural Synergy",
      description: "Complete your first AI-prioritized task schedule successfully.",
      iconName: "Zap",
      xpAwarded: 50,
      unlocked: true,
      unlockedAt: yesterdayStr
    },
    {
      id: "demo-ach-2",
      title: "Procrastination Slayer",
      description: "Complete a task that has been rescheduled or delayed 3+ times.",
      iconName: "ShieldCheck",
      xpAwarded: 100,
      unlocked: true,
      unlockedAt: todayStr
    },
    {
      id: "ach-3",
      title: "Flow State Master",
      description: "Log a continuous 90-minute Pomodoro/Focus deep work session.",
      iconName: "Flame",
      xpAwarded: 150,
      unlocked: true,
      unlockedAt: dayBeforeYesterdayStr
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
      unlocked: true,
      unlockedAt: fiveDaysAgoStr
    },
    {
      id: "ach-habit-7",
      title: "Momentum Anchor",
      description: "Maintain a 7-day habit loop streak for maximum neural consistency.",
      iconName: "Flame",
      xpAwarded: 100,
      unlocked: true,
      unlockedAt: yesterdayStr
    },
    {
      id: "ach-focus-deep",
      title: "Chronos Focus",
      description: "Complete a Pomodoro focus sprint block without active interruptions.",
      iconName: "Clock",
      xpAwarded: 60,
      unlocked: true,
      unlockedAt: dayBeforeYesterdayStr
    }
  ];

  const insights: AIInsights = {
    productivityScore: 89,
    focusScore: 85,
    weeklyAnalysis: "Exceptional development velocity! You are maintaining an active habit streak of 11 days. We detected 3 minor postponed items under 'Strategic Planning', but your 'Development' tasks have 100% completion metrics. Peak focus consistency occurs between 10:00 and 13:00.",
    burnoutWarning: "LOW RISK: Your stress recovery slots and mindfulness breaks are scheduled beautifully. Maintain these intervals to avoid burnout.",
    performanceInsights: [
      "Deep Work habits are showing a strong 8-day consistent streak.",
      "Tackling complex engineering items before 11:00 resulted in 35% faster completion velocity.",
      "Your focus consistency score increased by 14% compared to last week's average.",
      "Cognitive fatigue indicators are minimal on days with scheduled 15-minute breaks."
    ]
  };

  const coachMessages = [
    {
      role: "model",
      text: "Hello! I'm your AI Coach. I've reviewed your active tasks and habits. How can I help you plan your day, optimize your focus, or manage your workload?",
      timestamp: Date.now() - 4 * 60 * 60 * 1000
    },
    {
      role: "user",
      text: "I'm feeling heavily overwhelmed by this Q3 Product Roadmap deadline. I keep putting it off.",
      timestamp: Date.now() - 3.5 * 60 * 60 * 1000
    },
    {
      role: "model",
      text: "I completely understand. Strategic planning tasks carry high cognitive load, which triggers subconscious procrastination. Let's dismantle this hurdle together:\n\n1. **Use Micro-Actions**: Instead of 'Refining the entire Pitch Deck', focus exclusively on opening the Figma template and polishing slide titles for 10 minutes.\n2. **Rely on Buffer Blocks**: I've scheduled an adaptive buffer block at 15:00 to give you margin if you need to slide things over.\n3. **Try standard Pomodoros**: Do a single 25-minute sprint with pink rain audio active to enter flow state effortlessly.\n\nWould you like me to deconstruct this roadmap task into smaller, actionable subtasks?",
      timestamp: Date.now() - 3 * 60 * 60 * 1000
    },
    {
      role: "user",
      text: "Yes, please. That would make it feel much more manageable.",
      timestamp: Date.now() - 2.5 * 60 * 60 * 1000
    },
    {
      role: "model",
      text: "Done! I have successfully generated a clean subtask structure for 'Strategic Q3 Product Roadmap Alignment':\n\n- **Subtask 1**: Assess historic CAC spreadsheet and audit CAGR projections (Completed ✅)\n- **Subtask 2**: Polish high-contrast templates & slide layout graphics (Friction points mapped ⚠️)\n- **Subtask 3**: Record a brief 3m practicing video or voiceover\n\nYou've already completed the first subtask—that is a massive breakthrough! Ready to tackle Subtask 2 in a 25m Focus Block?",
      timestamp: Date.now() - 2 * 60 * 60 * 1000
    }
  ];

  return {
    tasks,
    habits,
    scheduleBlocks,
    achievements,
    insights,
    xp: 1450,
    level: 3,
    onboarding,
    coachMessages
  };
}
