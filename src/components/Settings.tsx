import React from "react";
import { 
  Settings as SettingsIcon, 
  Clock, 
  Timer, 
  Volume2, 
  Bell, 
  Sliders, 
  Sparkles,
  KeyRound,
  ShieldCheck,
  CheckCircle,
  Activity
} from "lucide-react";
import { UserSettings } from "../types";

interface SettingsProps {
  settings: UserSettings;
  onUpdateSettings: (updates: Partial<UserSettings>) => void;
}

export default function Settings({ settings, onUpdateSettings }: SettingsProps) {
  
  const handleInputChange = (field: keyof UserSettings, value: any) => {
    onUpdateSettings({ [field]: value });
  };

  return (
    <div id="flowmind-settings-workspace" className="flex-1 p-8 overflow-y-auto bg-[#050507] relative select-none">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <SettingsIcon className="w-7 h-7 text-cyan-400" /> Core System Node (Settings)
          </h1>
          <p className="text-xs text-white/40 font-mono mt-1">
            Configure system boundaries, Pomodoro timing vectors, biometric limits, and secure API bindings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT COLUMN: CRITICAL TIMEBOUNDS AND FOCUS INTERVALS (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Standard Time bounds */}
          <div className="bg-[#0c0c0e] border border-white/10 p-6 rounded-3xl backdrop-blur-md space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Clock className="w-5 h-5 text-cyan-400" /> Chrono Work-Hour Vectors
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-white/40 font-bold">Work Hours Commencement (Start)</label>
                <input
                  type="time"
                  value={settings.workHoursStart}
                  onChange={(e) => handleInputChange("workHoursStart", e.target.value)}
                  className="w-full bg-[#050507] border border-white/10 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-white/40 font-bold">Work Hours Termination (End)</label>
                <input
                  type="time"
                  value={settings.workHoursEnd}
                  onChange={(e) => handleInputChange("workHoursEnd", e.target.value)}
                  className="w-full bg-[#050507] border border-white/10 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                />
              </div>
            </div>
            <p className="text-[11px] text-white/40 leading-normal">
              These bounds restrict the AI Timeline Planner when allocating blocks and arranging recovery buffers.
            </p>
          </div>

          {/* Section 2: Pomodoro intervals config */}
          <div className="bg-[#0c0c0e] border border-white/10 p-6 rounded-3xl backdrop-blur-md space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Timer className="w-5 h-5 text-violet-400" /> Pomodoro Deep Work Intervals
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-white/40 font-bold">Focus Duration (Minutes)</label>
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={settings.pomoDuration}
                  onChange={(e) => handleInputChange("pomoDuration", Number(e.target.value))}
                  className="w-full bg-[#050507] border border-white/10 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-white/40 font-bold">Short Break Duration (Minutes)</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={settings.shortBreakDuration}
                  onChange={(e) => handleInputChange("shortBreakDuration", Number(e.target.value))}
                  className="w-full bg-[#050507] border border-white/10 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Biometric / Notification preferences */}
          <div className="bg-[#0c0c0e] border border-white/10 p-6 rounded-3xl backdrop-blur-md space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Sliders className="w-5 h-5 text-cyan-400" /> System Signal Preferences
            </h3>

            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer group bg-[#050507] border border-white/10 p-3.5 rounded-2xl hover:border-white/20 transition-all">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Volume2 className="w-4.5 h-4.5 text-cyan-400" /> Acoustic Alarm Beeps
                  </span>
                  <span className="text-[11px] text-white/40 block max-w-sm leading-normal">Emit custom audio chime upon completing scheduled Pomodoro blocks.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => handleInputChange("soundEnabled", e.target.checked)}
                  className="rounded text-cyan-500 bg-slate-850 border-slate-700 w-5 h-5"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group bg-[#050507] border border-white/10 p-3.5 rounded-2xl hover:border-white/20 transition-all">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Bell className="w-4.5 h-4.5 text-violet-400" /> Desktop Alerts
                  </span>
                  <span className="text-[11px] text-white/40 block max-w-sm leading-normal">Trigger operating system alerts when deadline risk alerts escalate.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={(e) => handleInputChange("notificationsEnabled", e.target.checked)}
                  className="rounded text-cyan-500 bg-slate-850 border-slate-700 w-5 h-5"
                />
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SECURE API SECRETS & CLOUD SYNC DATA INFORMATION */}
        <div className="space-y-6 flex flex-col justify-between bg-[#0c0c0e] border border-white/10 p-6 rounded-3xl backdrop-blur-md">
          {/* Section: Secure API secrets */}
          <div className="space-y-4">
            <div className="border-b border-white/10 pb-3 mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4.5 h-4.5 text-amber-500 animate-pulse" /> Secure API Secrets
              </h3>
              <p className="text-[11px] text-white/40">Secure full-stack API binding parameters</p>
            </div>

            <div className="bg-[#050507] border border-white/10 p-4 rounded-2xl space-y-3.5">
              <div className="flex items-start gap-2 text-xs text-white/60 leading-normal">
                <ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p>
                  <strong>API Security Intact:</strong> FlowMind AI employs a robust <strong>server-side Express proxy</strong>. 
                  Your Gemini keys are handled exclusively on the backend container and are never exposed to the client browser.
                </p>
              </div>

              <div className="border-t border-white/10 pt-3 space-y-1.5">
                <span className="text-[9.5px] font-mono text-white/40 uppercase font-black">Active API Key Node</span>
                <div className="flex items-center justify-between bg-white/5 border border-white/10 p-2.5 rounded-xl">
                  <span className="text-xs font-mono text-white/40 truncate">••••••••••••••••••••</span>
                  <span className="text-[10px] font-mono font-bold text-green-400 flex items-center gap-0.5">
                    <CheckCircle className="w-3.5 h-3.5 text-green-400" /> Loaded
                  </span>
                </div>
                <p className="text-[10px] text-white/40 leading-normal">
                  Secrecy is handled via your AI Studio <strong>Settings &gt; Secrets</strong> panel. No manual configuration required.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Bio statistics details */}
          <div className="border-t border-white/10 pt-4 bg-[#050507] p-4 rounded-2xl space-y-3">
            <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4" /> System Sync Health
            </h4>
            <div className="text-xs text-white/40 space-y-2 leading-relaxed">
              <p>
                <strong>System Version:</strong> <span className="font-mono text-white">FlowMind-v3.5.2</span>
              </p>
              <p>
                <strong>LocalStorage Sync:</strong> <span className="text-green-400">ACTIVE (Operational)</span>
              </p>
              <p>
                All workspace allocations, habit streaks, XP multipliers, and custom settings persist locally within your secure node sandbox.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
