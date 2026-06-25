/**
 * FlowMind AI — Local Smart Demo Responses
 * 
 * Pre-built, polished responses for common productivity coaching topics.
 * Returns instant responses for keyword-matched prompts WITHOUT hitting
 * the Gemini API — critical for hackathon demo reliability and quota savings.
 */

interface LocalResponse {
  keywords: string[];
  response: string;
}

const LOCAL_RESPONSES: LocalResponse[] = [
  {
    keywords: ["procrastinat", "putting off", "can't start", "delaying", "avoiding"],
    response: `Great question — procrastination is one of the most common productivity challenges, and it's completely normal.

Here's a proven 3-step action plan:

**1. Apply the 2-Minute Rule**
Pick the smallest possible action related to your task — something you can do in under 2 minutes. Open the document, write one sentence, or sketch one wireframe. Starting is the hardest part.

**2. Use Structured Sprints**
Set a 25-minute Pomodoro timer. Commit to focused work for just that window. After the timer, take a 5-minute break. You'll often find momentum carries you forward.

**3. Remove Friction**
Close unnecessary tabs, silence notifications, and set your workspace to "Focus Mode." Environmental cues dramatically reduce procrastination triggers.

Remember: **Progress beats perfection.** Even 10 minutes of focused work moves you forward. You've got this!`
  },
  {
    keywords: ["stress", "overwhelm", "anxious", "anxiety", "too much", "can't cope"],
    response: `I hear you — feeling stressed is your mind's signal that it needs some support. Let's address this constructively.

**Immediate Relief (Next 5 Minutes):**
• Try the 4-7-8 breathing technique: Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds. Repeat 3 times.
• Stand up, stretch, and look away from your screen for 60 seconds.

**Workload Triage:**
• Review your task list and identify the ONE most critical item for today.
• Move non-urgent items to tomorrow — giving yourself permission to defer is powerful.
• Break your biggest task into 3 smaller subtasks.

**Mindset Shift:**
• You don't need to finish everything today — you need to make meaningful progress on what matters most.
• Celebrate small wins. Each completed subtask is momentum.

**Pro Tip:** Use FlowMind's Planner to auto-schedule recovery breaks between intense work blocks. Your brain needs rest to perform at its best.`
  },
  {
    keywords: ["burnout", "exhausted", "burned out", "drained", "fatigue", "tired"],
    response: `Burnout is a serious signal — thank you for recognizing it. Let's create a sustainable recovery plan.

**Signs You're Burning Out:**
• Persistent fatigue even after rest
• Reduced motivation on tasks you normally enjoy
• Difficulty concentrating or making decisions

**Recovery Strategy:**

**1. Protect Your Energy**
Reduce your daily task load by 30-40%. Focus only on high-impact items. Use FlowMind's AI Prioritizer to identify what truly matters today.

**2. Schedule Non-Negotiable Breaks**
Block 15-minute recovery windows every 90 minutes. Step away from screens completely during these breaks.

**3. Set Hard Boundaries**
Define a firm end time for your workday. After that, no task management, no emails, no "just one more thing."

**4. Restore with Micro-Habits**
• 10 minutes of light movement (walk, stretch)
• 5 minutes of mindful breathing
• Adequate hydration and nutrition

**Remember:** Sustainable productivity comes from rest, not relentless output. Taking care of yourself IS being productive.`
  },
  {
    keywords: ["focus", "distract", "concentrate", "attention", "can't focus", "scattered"],
    response: `Let's sharpen your focus with research-backed strategies.

**Environment Setup:**
• Close all unnecessary browser tabs and apps
• Put your phone in another room or on Do Not Disturb
• Use noise-cancelling headphones with ambient sounds or lo-fi music

**The Focus Protocol:**

**1. Single-Task Commitment**
Choose ONE task. Write it on a sticky note and place it where you can see it. This is your only objective for the next 25-50 minutes.

**2. Pomodoro Technique**
• Work for 25 minutes with zero interruptions
• Take a 5-minute break (stand, stretch, hydrate)
• After 4 cycles, take a longer 15-20 minute break

**3. Time-Block Your Day**
Use FlowMind's Planner to assign specific tasks to specific time slots. When you know WHAT to do and WHEN to do it, decision fatigue drops dramatically.

**4. Energy Matching**
Schedule your hardest tasks during your peak energy hours (usually 9-11 AM for most people). Save routine tasks for low-energy periods.

**Quick Win:** Start a Focus Mode session right now in FlowMind to build momentum!`
  },
  {
    keywords: ["motivat", "inspire", "pep talk", "encourage", "don't feel like", "unmotivated"],
    response: `Let me be real with you: **motivation is not something you wait for — it's something you create through action.**

**Here's what I know about you:**
You're here, using a productivity tool, thinking about your goals. That already puts you ahead of most people. Give yourself credit for that.

**The Motivation Flywheel:**

**1. Start Ridiculously Small**
Don't try to "feel motivated." Instead, commit to just 5 minutes on your most important task. Action creates motivation, not the other way around.

**2. Stack Your Wins**
Complete one small task. Then another. Each completion releases dopamine and builds momentum. Use FlowMind's task completion tracking to visualize your progress.

**3. Connect to Your Why**
Spend 30 seconds asking: "Why does this task matter to me?" Connecting tasks to meaningful outcomes makes them feel less like chores.

**4. Reward Yourself**
After completing a focused work block, give yourself a genuine reward — a snack, a short walk, or 5 minutes of something you enjoy.

**Your daily challenge:** Complete just 3 tasks today. Not 10, not 20 — just 3 meaningful ones. You'll be amazed at how good that feels.

**You've got this. Let's make today count! 💪**`
  },
  {
    keywords: ["schedule", "plan my day", "time block", "organize", "routine", "daily plan"],
    response: `Here's a proven framework for planning an effective day:

**The Ideal Daily Structure:**

**Morning Block (High Energy)**
• 09:00–09:30: Review tasks, set top 3 priorities
• 09:30–11:30: Deep Work Block #1 — tackle your hardest, most important task
• 11:30–11:45: Short break + hydration

**Midday Block (Moderate Energy)**
• 11:45–13:00: Deep Work Block #2 — second priority task
• 13:00–14:00: Lunch + complete screen detox

**Afternoon Block (Variable Energy)**
• 14:00–15:30: Collaborative work, meetings, or lighter tasks
• 15:30–15:45: Break + movement
• 15:45–17:00: Admin tasks, emails, planning tomorrow

**Key Principles:**
• **Eat the frog first** — do the hardest task when your energy is highest
• **Protect deep work blocks** — no notifications, no multitasking
• **Build in buffer time** — add 15-minute buffers between blocks for overflow
• **End with tomorrow's plan** — spend 5 minutes at day's end planning tomorrow

**Pro Tip:** Use FlowMind's AI Planner to auto-generate an optimized schedule based on your actual tasks, mood, and stress level!`
  },
  {
    keywords: ["productiv", "efficient", "get more done", "optimize", "performance", "accomplish"],
    response: `Here are the highest-impact productivity strategies backed by research:

**The Productivity Essentials:**

**1. The 80/20 Rule (Pareto Principle)**
Identify the 20% of tasks that produce 80% of your results. Focus relentlessly on those and delegate or defer the rest.

**2. Deep Work > Busy Work**
One hour of focused, distraction-free work produces more value than 3 hours of scattered multitasking. Block dedicated deep work sessions.

**3. Energy Management > Time Management**
Track when you feel most alert and focused. Schedule demanding tasks during peak hours and routine tasks during dips.

**4. The Two-Minute Rule**
If a task takes less than 2 minutes, do it immediately. This prevents small tasks from accumulating into an overwhelming backlog.

**5. Weekly Reviews**
Every Friday, spend 15 minutes reviewing what you accomplished, what got stuck, and what to prioritize next week. Use FlowMind's Insights dashboard for this.

**Daily System:**
1. Identify your Top 3 tasks each morning
2. Time-block your calendar
3. Do deep work first, admin work later
4. Take breaks every 90 minutes
5. End the day by planning tomorrow

**Remember:** Being productive isn't about doing more — it's about doing what matters most, consistently.`
  },
  {
    keywords: ["habit", "routine", "consistency", "streak", "discipline", "daily practice"],
    response: `Building lasting habits is one of the most powerful things you can do for long-term productivity.

**The Habit Formation Framework:**

**1. Start Tiny**
Don't commit to "exercise for an hour." Start with "put on workout shoes." The goal is to make the habit so small it's impossible to fail.

**2. Stack Your Habits**
Attach new habits to existing ones: "After I pour my morning coffee, I will review my task list for 5 minutes."

**3. Track Streaks**
Visual progress is incredibly motivating. Use FlowMind's Habits Tracker to maintain your streaks — the chain effect makes skipping feel costly.

**4. Design Your Environment**
Make good habits easy and bad habits hard. Put your journal on your desk, remove social media from your home screen.

**5. Never Miss Twice**
Missing once is human. Missing twice is a new pattern forming. If you break a streak, get back on track immediately the next day.

**High-Impact Daily Habits:**
• ☀️ Morning: 5-min task review + intention setting
• 🎯 Midday: One deep work Pomodoro block
• 🌙 Evening: 3-min reflection on what went well

**Your streak is your superpower. Protect it!**`
  }
];

/**
 * Check if a user prompt matches any local smart response.
 * Returns the response text if matched, or null if no match (should call Gemini).
 */
export function getLocalSmartResponse(prompt: string): string | null {
  if (!prompt || prompt.length < 3) return null;

  const normalized = prompt.toLowerCase();

  for (const entry of LOCAL_RESPONSES) {
    const matchCount = entry.keywords.filter(kw => normalized.includes(kw)).length;
    // Require at least one keyword match
    if (matchCount > 0) {
      console.log(`[Local Response] Matched keywords for prompt: "${prompt.slice(0, 60)}..." — serving local response (saved 1 Gemini call)`);
      return entry.response;
    }
  }

  return null;
}
