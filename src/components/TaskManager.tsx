import React, { useState } from "react";
import { 
  Sparkles, 
  Trash2, 
  Check, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Download, 
  Upload, 
  ListTodo, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  HelpCircle,
  TrendingDown,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet
} from "lucide-react";
import { Task, SubTask, Priority } from "../types";

interface TaskManagerProps {
  tasks: Task[];
  onAddTask: (task: Partial<Task>) => void;
  onEditTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onTriggerPrioritize: (id: string) => Promise<void>;
  isPrioritizingTask: string | null;
  onTriggerGoalBreakdown: (id: string) => Promise<void>;
  isBreakingDownTask: string | null;
  onResetTasks: () => void;
}

export default function TaskManager({
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onTriggerPrioritize,
  isPrioritizingTask,
  onTriggerGoalBreakdown,
  isBreakingDownTask,
  onResetTasks
}: TaskManagerProps) {
  // Local States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("dueDate"); // dueDate, priorityScore, title
  const [confirmReset, setConfirmReset] = useState(false);
  const [taskNotification, setTaskNotification] = useState<{ text: string; type: "info" | "success" } | null>(null);
  
  // Create Form State
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");
  const [newCategory, setNewCategory] = useState("Development");
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [newDueTime, setNewDueTime] = useState("17:00");
  const [newDuration, setNewDuration] = useState(60);

  // Expanded Task State
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // New subtask local input state
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // Bulk Import state
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");

  // Get unique categories for filters
  const uniqueCategories = Array.from(new Set(tasks.map((t) => t.category))).filter(Boolean);

  // Handlers
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle,
      description: newDesc,
      priority: newPriority,
      category: newCategory,
      dueDate: newDueDate,
      dueTime: newDueTime,
      duration: Number(newDuration),
      completed: false,
      procrastinationCount: 0,
      subtasks: []
    });

    // Reset Form
    setNewTitle("");
    setNewDesc("");
    setNewPriority("medium");
    setNewCategory("Development");
    setNewDueDate(new Date().toISOString().split("T")[0]);
    setNewDueTime("17:00");
    setNewDuration(60);
    setIsAddFormOpen(false);
  };

  // Add custom Subtask directly on an expanded task
  const handleAddSubtask = (taskId: string) => {
    if (!newSubtaskTitle.trim()) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newSub: SubTask = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle,
      completed: false
    };

    onEditTask(taskId, {
      subtasks: [...task.subtasks, newSub]
    });
    setNewSubtaskTitle("");
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedSubs = task.subtasks.map(sub => {
      if (sub.id === subtaskId) {
        return { ...sub, completed: !sub.completed };
      }
      return sub;
    });

    onEditTask(taskId, { subtasks: updatedSubs });
  };

  // Procrastination increment helper
  const handlePostponeTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Delays task due date by 1 day
    const currentDueDate = new Date(task.dueDate);
    currentDueDate.setDate(currentDueDate.getDate() + 1);
    const nextDateStr = currentDueDate.toISOString().split("T")[0];

    onEditTask(taskId, {
      dueDate: nextDateStr,
      procrastinationCount: task.procrastinationCount + 1
    });
  };

  // Bulk parser (Simple CSV or line-by-line format: Title, Category, Priority, Duration)
  const handleBulkImport = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText.split("\n");
    let importedCount = 0;

    lines.forEach((line) => {
      if (!line.trim()) return;
      const parts = line.split(",");
      const title = parts[0]?.trim();
      const category = parts[1]?.trim() || "Imported";
      const priorityRaw = parts[2]?.trim()?.toLowerCase();
      const priority: Priority = (priorityRaw === "high" || priorityRaw === "low" || priorityRaw === "medium") ? priorityRaw : "medium";
      const duration = Number(parts[3]?.trim()) || 45;

      if (title) {
        onAddTask({
          title,
          category,
          priority,
          duration,
          completed: false,
          procrastinationCount: 0,
          dueDate: new Date().toISOString().split("T")[0],
          dueTime: "17:00",
          subtasks: []
        });
        importedCount++;
      }
    });

    setBulkText("");
    setIsImportOpen(false);
    alert(`Successfully imported ${importedCount} tasks from payload.`);
  };

  // CSV Exporter
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Title,Description,Priority,Category,DueDate,DueTime,Duration(min),Completed,ProcrastinationCount\n";
    
    tasks.forEach((task) => {
      const row = [
        task.id,
        `"${task.title.replace(/"/g, '""')}"`,
        `"${task.description.replace(/"/g, '""')}"`,
        task.priority,
        task.category,
        task.dueDate,
        task.dueTime,
        task.duration,
        task.completed ? "TRUE" : "FALSE",
        task.procrastinationCount
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `flowmind_tasks_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Sort core
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
    const matchesCategory = filterCategory === "all" || task.category === filterCategory;
    const matchesStatus = filterStatus === "all" || 
                          (filterStatus === "completed" && task.completed) || 
                          (filterStatus === "active" && !task.completed);
    return matchesSearch && matchesPriority && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === "dueDate") {
      return `${a.dueDate} ${a.dueTime}`.localeCompare(`${b.dueDate} ${b.dueTime}`);
    }
    if (sortBy === "priorityScore") {
      // Sort desc by AI Priority score
      return (b.aiPriorityScore || 0) - (a.aiPriorityScore || 0);
    }
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return (
    <div id="flowmind-tasks-workspace" className="flex-1 p-8 overflow-y-auto bg-[#050507] relative select-none">
      {/* TASK NOTIFICATION BANNER */}
      {taskNotification && (
        <div className="mb-6 px-4 py-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono flex items-center gap-2 animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>{taskNotification.text}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <ListTodo className="w-7 h-7 text-cyan-400" /> Task List
          </h1>
          <p className="text-xs text-white/40 mt-1">
            Organize, prioritize, and manage your daily and weekly task list.
          </p>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-3.5 flex-wrap">
          {/* Safe Inline Reset Button */}
          <button
            id="task-btn-reset"
            onClick={() => {
              if (!confirmReset) {
                setConfirmReset(true);
                // Automatically reset back to normal if user doesn't confirm within 5 seconds
                setTimeout(() => setConfirmReset(false), 5000);
              } else {
                setConfirmReset(false);
                onResetTasks();
                setTaskNotification({ text: "Task matrix successfully reset to calibrated presets.", type: "success" });
                setTimeout(() => setTaskNotification(null), 4000);
              }
            }}
            className={`px-4 py-2.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              confirmReset
                ? "border-rose-500 bg-rose-500/10 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                : "border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10"
            }`}
            title={confirmReset ? "Click once more to wipe modifications and restore default seeding" : "Reset task list to default presets"}
          >
            <RefreshCw className={`w-4 h-4 ${confirmReset ? "animate-spin text-rose-400" : "text-white/60"}`} />
            <span>{confirmReset ? "Confirm Reset?" : "Reset Tasks"}</span>
          </button>

          <button
            id="task-btn-csv-export"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10 text-xs font-mono font-bold flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-white/60" /> Export CSV
          </button>
          
          <button
            id="task-btn-bulk-import"
            onClick={() => setIsImportOpen(!isImportOpen)}
            className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10 text-xs font-mono font-bold flex items-center gap-2 transition-all"
          >
            <Upload className="w-4 h-4 text-white/60" /> Bulk Import
          </button>

          <button
            id="task-btn-open-add"
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:shadow-[0_0_20px_rgba(34,211,238,0.25)] text-white text-xs font-bold font-sans flex items-center gap-2 border border-white/10 transition-all"
          >
            <Plus className="w-4.5 h-4.5" /> Add Task
          </button>
        </div>
      </div>

      {/* BULK IMPORT TEXT AREA DRAWER */}
      {isImportOpen && (
        <div className="bg-[#0c0c0e] border border-white/10 p-6 rounded-2xl mb-8 space-y-4 backdrop-blur-md">
          <div>
            <h3 className="text-sm font-bold text-white">Bulk Task Comma Parser</h3>
            <p className="text-xs text-white/40 mt-1">
              Input format: <code className="text-cyan-400 font-mono bg-[#050507] px-1 py-0.5 rounded text-[10px]">Title, Category, Priority(low/medium/high), Duration(mins)</code> on separate lines.
            </p>
          </div>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="Implement Zod Router, Engineering, High, 60&#10;Write Weekly Review Document, Strategic Planning, Medium, 45"
            className="w-full h-32 bg-[#050507] border border-white/10 rounded-xl p-3 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsImportOpen(false)}
              className="px-4 py-2 text-xs font-mono bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkImport}
              className="px-4 py-2 text-xs font-mono bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-lg"
            >
              Parse & Inject
            </button>
          </div>
        </div>
      )}

      {/* CREATE TASK DRAWER/FORM */}
      {isAddFormOpen && (
        <form onSubmit={handleCreateTask} className="bg-[#0c0c0e] border border-white/10 p-6 rounded-2xl mb-8 space-y-4 backdrop-blur-md">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Plus className="w-4.5 h-4.5 text-cyan-400" /> Add New Task
            </h3>
            <span className="text-[10px] text-white/40 font-mono">Task Details</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Title */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-mono uppercase text-white/40 font-bold">Task Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Pitch Deck Refinement, Write Unit Tests, etc..."
                className="w-full bg-[#050507] border border-white/10 focus:border-cyan-500/50 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-white/40 font-bold">Category</label>
              <input
                type="text"
                required
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Development, Strategic, Admin..."
                className="w-full bg-[#050507] border border-white/10 focus:border-cyan-500/50 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div className="space-y-1 md:col-span-3">
              <label className="text-[10px] font-mono uppercase text-white/40 font-bold">Details</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Core objectives, deliverables, resources, context..."
                className="w-full bg-[#050507] border border-white/10 focus:border-cyan-500/50 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none h-18"
              />
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-white/40 font-bold">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as Priority)}
                className="w-full bg-[#050507] border border-white/10 focus:border-cyan-500/50 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-white/40 font-bold">Due Date</label>
              <input
                type="date"
                required
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full bg-[#050507] border border-white/10 focus:border-cyan-500/50 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
              />
            </div>

            {/* Due Time */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-white/40 font-bold">Due Time</label>
              <input
                type="time"
                required
                value={newDueTime}
                onChange={(e) => setNewDueTime(e.target.value)}
                className="w-full bg-[#050507] border border-white/10 focus:border-cyan-500/50 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
              />
            </div>

            {/* Duration */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-white/40 font-bold">Est. Duration (Minutes)</label>
              <input
                type="number"
                required
                value={newDuration}
                onChange={(e) => setNewDuration(Number(e.target.value))}
                min={5}
                className="w-full bg-[#050507] border border-white/10 focus:border-cyan-500/50 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsAddFormOpen(false)}
              className="px-4 py-2 text-xs font-mono bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-cyan-400 hover:bg-cyan-500 text-black rounded-lg transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]"
            >
              Add Task
            </button>
          </div>
        </form>
      )}

      {/* FILTER & SORT TOOLBAR */}
      <section className="bg-[#0c0c0e] border border-white/10 p-4 rounded-2xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050507] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none placeholder-white/30"
          />
        </div>

        {/* Filter selects */}
        <div className="flex items-center gap-3.5 flex-wrap">
          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-[#050507] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white/80 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#050507] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white/80 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#050507] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white/80 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="all">All Status</option>
            <option value="active">Active Tasks</option>
            <option value="completed">Completed Tasks</option>
          </select>

          {/* Sorting filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#050507] border border-cyan-500/20 text-cyan-300 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="priorityScore">Sort by AI Priority</option>
            <option value="title">Sort by Name</option>
          </select>
        </div>
      </section>

      {/* TASKS MATRIX LIST */}
      <section className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-16 bg-[#0c0c0e] border border-white/10 rounded-2xl space-y-4 max-w-2xl mx-auto p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto mb-2 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
              <ListTodo className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">No tasks yet</h3>
            <p className="text-xs text-white/50 max-w-md mx-auto leading-relaxed">
              Add your first task to begin planning smarter. We will automatically analyze deadline risk, prioritize workloads, and generate optimized timelines.
            </p>
            <button
              onClick={() => setIsAddFormOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-white text-xs font-bold font-sans flex items-center gap-2 mx-auto hover:shadow-[0_0_15px_rgba(34,211,238,0.25)] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Your First Task
            </button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16 bg-[#0c0c0e] border border-white/10 rounded-2xl space-y-3">
            <ListTodo className="w-12 h-12 text-white/20 mx-auto" />
            <h3 className="text-sm font-bold text-white/50">No Tasks Found</h3>
            <p className="text-xs text-white/40 max-w-sm mx-auto">
              Refine your filters, search queries, or add a new task to update your list.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isExpanded = expandedTaskId === task.id;
            const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
            const totalSubtasks = task.subtasks.length;
            const subtaskProgressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
            
            return (
              <div
                key={task.id}
                id={`task-node-${task.id}`}
                className={`border rounded-2xl transition-all duration-200 backdrop-blur-md overflow-hidden ${
                  task.completed 
                    ? "bg-white/5 border-white/5 opacity-50" 
                    : isExpanded 
                    ? "bg-[#0c0c0e] border-cyan-500/35 shadow-lg"
                    : "bg-white/5 border border-white/10 hover:border-white/20"
                }`}
              >
                {/* PRIMARY VIEW ROW */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Checkbox + Title */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <button
                      id={`task-toggle-complete-${task.id}`}
                      onClick={() => onEditTask(task.id, { completed: !task.completed })}
                      className={`w-5.5 h-5.5 rounded-lg border flex items-center justify-center transition-all flex-shrink-0 mt-0.5 ${
                        task.completed
                          ? "bg-cyan-500 border-cyan-500 text-black"
                          : "border-white/20 hover:border-cyan-400 bg-white/5"
                      }`}
                    >
                      {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-sm font-bold text-white tracking-wide truncate ${task.completed ? "line-through text-white/30" : ""}`}>
                          {task.title}
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-white/5 text-white/60 border border-white/10 rounded">
                          {task.category}
                        </span>
                        
                        {/* Priority Badge */}
                        <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                          task.priority === "high" 
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                            : task.priority === "medium" 
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                            : "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                        }`}>
                          {task.priority}
                        </span>

                        {/* AI Priority Indicator */}
                        {task.aiPriorityScore && (
                          <span className="text-[9px] font-mono bg-gradient-to-r from-cyan-400 to-blue-500 text-black px-1.5 py-0.5 rounded font-extrabold flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5 animate-pulse" /> AI Priority: {task.aiPriorityScore}
                          </span>
                        )}
                      </div>

                      <p className={`text-xs text-white/60 line-clamp-1 ${task.completed ? "text-white/30" : ""}`}>
                        {task.description || "No description provided."}
                      </p>

                      {/* Subtask micro progress */}
                      {totalSubtasks > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-white/40">Subtasks ({completedSubtasks}/{totalSubtasks})</span>
                          <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${subtaskProgressPercent}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Date, Time, Duration & Expanded triggers */}
                  <div className="flex items-center gap-4 justify-between md:justify-end flex-shrink-0">
                    <div className="flex items-center gap-3.5 text-xs text-white/50 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-white/40" />
                        <span>{task.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-white/40" />
                        <span>{task.dueTime} ({task.duration}m)</span>
                      </div>
                    </div>

                    {/* Procrastination tracker warning badge */}
                    {task.procrastinationCount > 0 && (
                      <span className="text-[10px] font-mono bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full flex items-center gap-1" title="Postponed frequency count">
                        <TrendingDown className="w-3.5 h-3.5 text-rose-400" /> +{task.procrastinationCount} Delayed
                      </span>
                    )}

                    {/* Actions tray */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                        className="p-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 text-white/60 hover:text-white"
                        title="View Details & Subtasks"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-white/30 hover:text-rose-400"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* EXPANDED SUB PANEL */}
                {isExpanded && (
                  <div className="border-t border-white/10 bg-[#050507] p-5 space-y-6">
                    
                    {/* Grid of AI controls and notes */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Subtasks listing */}
                      <div className="lg:col-span-2 space-y-3.5">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <h4 className="text-xs font-mono font-bold text-white/60 uppercase tracking-wider">Subtasks</h4>
                          <span className="text-[10px] font-mono text-cyan-400 font-bold">{subtaskProgressPercent}% Completed</span>
                        </div>

                        {/* List of subtasks */}
                        <div className="space-y-2">
                          {task.subtasks.map((sub) => (
                            <label
                              key={sub.id}
                              className="flex items-center justify-between bg-white/5 border border-white/10 hover:border-white/20 p-2.5 rounded-xl cursor-pointer transition-all"
                            >
                              <div className="flex items-center gap-2.5">
                                <input
                                  type="checkbox"
                                  checked={sub.completed}
                                  onChange={() => handleToggleSubtask(task.id, sub.id)}
                                  className="rounded text-cyan-500 bg-[#050507] border-white/10 w-4 h-4"
                                />
                                <span className={`text-xs text-white/80 ${sub.completed ? "line-through text-white/30" : ""}`}>
                                  {sub.title}
                                </span>
                              </div>
                              {sub.durationMin && (
                                <span className="text-[10px] font-mono text-white/40">{sub.durationMin} minutes</span>
                              )}
                            </label>
                          ))}
                        </div>

                        {/* Add subtask input */}
                        <div className="flex items-center gap-2.5">
                          <input
                            type="text"
                            placeholder="Add subtask..."
                            value={newSubtaskTitle}
                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddSubtask(task.id);
                            }}
                            className="flex-1 bg-[#050507] border border-white/10 focus:border-cyan-500/50 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none placeholder-white/30"
                          />
                          <button
                            onClick={() => handleAddSubtask(task.id)}
                            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 font-bold flex items-center gap-1.5 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5 text-cyan-400" /> Add
                          </button>
                        </div>
                      </div>

                      {/* AI Calibration Controls Panel */}
                      <div className="bg-[#0c0c0e] border border-white/10 p-4 rounded-2xl flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> AI Assistant
                          </h4>
                          <p className="text-[11px] text-white/50 leading-normal">
                            Analyze risk level and prioritize this task based on workload.
                          </p>
                        </div>

                        <div className="space-y-2 flex-1 flex flex-col justify-center">
                          {task.aiRiskLevel ? (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-white/50 font-mono">Risk Level:</span>
                                <span className={`font-black font-mono uppercase ${task.aiRiskLevel === 'high' ? 'text-rose-400' : task.aiRiskLevel === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                  {task.aiRiskLevel} ({task.aiRiskPercentage || 0}%)
                                </span>
                              </div>
                              <div className="text-[10px] text-white/80 leading-snug bg-white/5 p-2 rounded-xl border border-white/10">
                                <strong>Insight:</strong> {task.aiRiskReason}
                              </div>
                              {task.aiCorrectiveAction && (
                                <div className="text-[9.5px] text-cyan-300 font-mono leading-snug bg-cyan-500/5 border border-cyan-500/10 p-2 rounded-xl">
                                  <strong>Mitigation:</strong> {task.aiCorrectiveAction}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-[10px] text-white/40">
                              AI analysis not yet generated for this task.
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {/* Run Prioritization */}
                          <button
                            onClick={() => onTriggerPrioritize(task.id)}
                            disabled={isPrioritizingTask === task.id}
                            className="px-2 py-2 text-[10px] font-mono font-bold rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-cyan-400 flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isPrioritizingTask === task.id ? "animate-spin" : ""}`} />
                            {isPrioritizingTask === task.id ? "Analyzing..." : "Analyze Task"}
                          </button>

                          {/* Run Breakdown */}
                          <button
                            onClick={() => onTriggerGoalBreakdown(task.id)}
                            disabled={isBreakingDownTask === task.id}
                            className="px-2 py-2 text-[10px] font-mono font-bold rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-indigo-300 flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                          >
                            <Sparkles className={`w-3.5 h-3.5 ${isBreakingDownTask === task.id ? "animate-spin" : ""}`} />
                            {isBreakingDownTask === task.id ? "Structuring..." : "Breakdown Task"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Lower task configuration (Adjusted details and manual reschedule postponement) */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
                      <div className="text-[11px] text-white/40 leading-normal space-y-1">
                        <div>
                          <strong>Created:</strong> {task.createdAt ? new Date(task.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : task.createdDate}
                          {task.updatedAt && (
                            <>
                              <span className="mx-2 text-white/20">|</span>
                              <strong>Last Updated:</strong> {new Date(task.updatedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                            </>
                          )}
                        </div>
                        <div>
                          <strong>Delays:</strong> {task.procrastinationCount} delays
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {/* Postpone button */}
                        <button
                          onClick={() => handlePostponeTask(task.id)}
                          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                          title="Reschedule task to tomorrow due to block friction"
                        >
                          <TrendingDown className="w-3.5 h-3.5 text-rose-400" /> Postpone 1 Day
                        </button>

                        <button
                          onClick={() => onEditTask(task.id, { completed: !task.completed })}
                          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                            task.completed
                              ? "bg-white/5 border border-white/10 text-white/40"
                              : "bg-cyan-400 hover:bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                          }`}
                        >
                          {task.completed ? "Mark Uncompleted" : "Complete Task"}
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
