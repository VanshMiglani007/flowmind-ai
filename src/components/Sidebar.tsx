import React from "react";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  Timer, 
  Activity, 
  MessageSquareCode, 
  Settings, 
  Award, 
  Sparkles,
  Zap,
  Home
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  xp: number;
  level: number;
  onReturnToLanding?: () => void;
  isCoachLive?: boolean;
}

export default function Sidebar({ activeTab, setActiveTab, xp, level, onReturnToLanding, isCoachLive }: SidebarProps) {
  const nextLevelXp = level * 500;
  const prevLevelXp = (level - 1) * 500;
  const currentLevelProgress = xp - prevLevelXp;
  const xpNeededForNextLevel = nextLevelXp - prevLevelXp;
  const progressPercent = Math.min(100, Math.max(0, (currentLevelProgress / xpNeededForNextLevel) * 100));

  const menuItems = [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
    { id: "tasks", name: "Tasks", icon: CheckSquare },
    { id: "planner", name: "Planner", icon: Calendar },
    { id: "focus", name: "Focus Mode", icon: Timer },
    { id: "habits", name: "Habits", icon: Activity },
    { id: "coach", name: "AI Coach", icon: MessageSquareCode },
    { id: "settings", name: "Settings", icon: Settings },
  ];

  return (
    <aside id="flowmind-sidebar" className="w-64 h-full flex flex-col bg-[#08080a] border-r border-white/10 select-none">
      {/* Brand Title with Return Home */}
      <div className="p-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.4)] shrink-0">
            <div className="w-4 h-4 bg-white/20 rounded-full blur-[2px]"></div>
          </div>
          <div>
            <h1 className="text-md font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              FlowMind AI
            </h1>
          </div>
        </div>

        {onReturnToLanding && (
          <button
            onClick={onReturnToLanding}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all border border-white/10 flex items-center justify-center cursor-pointer group"
            title="Return to Landing Page"
          >
            <Home className="w-4 h-4 group-hover:scale-105 transition-transform" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                isActive
                  ? "bg-white/5 border border-white/10 text-cyan-400"
                  : "text-white/50 hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "text-cyan-400" : "text-white/50"}`} />
              <span className="font-medium text-sm">{item.name}</span>
              
              {item.id === "coach" && isCoachLive && (
                <span className="ml-auto text-[9px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-cyan-300 animate-spin" style={{ animationDuration: '6s' }} /> Live
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Gamification Indicator bottom panel */}
      <div className="mt-auto p-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-white/10 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] uppercase tracking-widest text-white/40">Current Level</span>
            <span className="text-xs font-bold text-indigo-400">LVL {level}</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-white/40 mt-2">
            <span>{xp} / {nextLevelXp} XP</span>
            <span className="text-[10px] font-mono text-cyan-400">
              {level === 1 ? "Flow Initiate" : level === 2 ? "Momentum Builder" : level === 3 ? "Focus Architect" : level === 4 ? "Productivity Strategist" : "Deep Work Master"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
