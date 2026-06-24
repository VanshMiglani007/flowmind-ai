# 🧠 FlowMind AI — Futuristic Focus & Productivity Workspace

<div align="center">
  <img src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" width="800" alt="FlowMind AI Banner" style="border-radius: 12px; margin-bottom: 20px;" />

  [![React](https://img.shields.io/badge/React-19.0-blue?logo=react&logoColor=white&style=flat-square)](#)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript&logoColor=white&style=flat-square)](#)
  [![Vite](https://img.shields.io/badge/Vite-6.2-purple?logo=vite&logoColor=white&style=flat-square)](#)
  [![Express](https://img.shields.io/badge/Express-4.21-lightgrey?logo=express&logoColor=white&style=flat-square)](#)
  [![Gemini](https://img.shields.io/badge/Gemini_API-3.5_Flash-orange?logo=google&logoColor=white&style=flat-square)](#)
  [![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](#)
</div>

---

## 🌌 Introduction

**FlowMind AI** is an extremely modern, futuristic AI-powered productivity workspace designed to harmonize smart task management, daily scheduling, emotional energy balance, and focus tracking.

Unlike traditional static to-do lists that ignore human cognitive load and fatigue levels, FlowMind AI dynamically adjusts workloads based on self-reported stress, mood, and focus patterns. Powered by a server-side **Google Gemini AI API Integration**, the application features an active **AI Productivity Coach** that deconstructs intimidating goals into structured subtasks, constructs optimal day timelines, and delivers stress-recovery buffers when burnout indicators are detected.

---

## ✨ Main Features

*   🤖 **AI Productivity Coach**: A persistent chat companion that maintains history, reviews your workloads, and provides professional productivity guidance.
*   📅 **Intelligent Time-Blocking (AI Day Planner)**: Generates customized daily schedules based on work hour limits, mood, stress level, and task density.
*   ⚡ **Smart Goal Deconstructor**: Breaks large, complex milestones down into actionable 4-to-6 step subtasks with duration estimates.
*   🛡️ **Burnout Prediction & Prevention**: Monitors task load density and procrastination triggers, warning the user and injecting recovery sessions (like breathing cycles).
*   🎮 **XP & Gamification Engine**: Earn Experience Points (XP) by completing tasks, ticking off habits, and finishing Pomodoro focus sessions.
*   ⏱️ **Sci-Fi Pomodoro Timer**: Visual focus counts accompanied by immersive acoustic cues and micro-animations to induce deep-work state.
*   📈 **Weekly Review & Diagnostics**: Synthesizes custom weekly diagnostics, generating scores for productivity vectors and offering clear behavioral insights.
*   💾 **LocalStorage Sandbox**: Local persistence caches all active priorities, habits, workspace allocations, and coach history directly inside the user's browser.
*   📶 **Offline Resilience Handler**: Stashes pending prompts in a local queue during network disruptions and resumes execution seamlessly when online.

---

## 🛠️ Tech Stack

### Frontend Architecture
*   **React 19 (SPA)**: Component-based reactive user interface.
*   **TypeScript**: Complete static type-safety across the application.
*   **Tailwind CSS**: Branded cyberpunk styling system with smooth gradients, dark mode, and glassmorphism.
*   **Framer Motion**: Fluid, hardware-accelerated animations and micro-interactions.
*   **Lucide React**: Clean, modern iconography vector set.
*   **Recharts**: Interactive data visualizations for weekly metrics.

### Backend Infrastructure
*   **Express**: High-performance backend API routing server.
*   **TSX**: Runtime Node executor for TypeScript without pre-compiling.
*   **Esbuild**: Production server-side bundler.
*   **Google Gen AI Node SDK**: Streamlined client interface to access the Gemini API.

---

## 📸 Screenshots

> [!NOTE]
> *Placeholders for your interactive showcase screenshots or demo videos.*

| Dashboard View | AI Timeline Planner |
| :---: | :---: |
| ![Dashboard Placeholder](https://via.placeholder.com/600x350/0c0c0e/cyan?text=Dashboard+Overview) | ![Planner Placeholder](https://via.placeholder.com/600x350/0c0c0e/violet?text=AI+Timeline+Planner) |

| Smart Task Manager | AI Productivity Coach |
| :---: | :---: |
| ![Tasks Placeholder](https://via.placeholder.com/600x350/0c0c0e/amber?text=Smart+Task+Manager) | ![Coach Placeholder](https://via.placeholder.com/600x350/0c0c0e/green?text=AI+Productivity+Coach) |

---

## ⚙️ Installation Instructions

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
*   [NPM](https://www.npmjs.com/) (usually packaged with Node)

### Step-by-Step Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Vanshmiglani007/flowmind-ai.git
    cd flowmind-ai
    ```

2.  **Install System Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Copy `.env.example` to `.env.local` to start local configuration.
    ```bash
    cp .env.example .env.local
    ```

---

## 🔐 Environment Variables

The project requires the following keys configured inside `.env.local`:

```env
# GEMINI_API_KEY: Secure Gemini AI API key to authorize backend requests.
GEMINI_API_KEY="your_api_key_here"

# APP_URL: The hosting location of this application.
APP_URL="http://localhost:3000"
```

> [!WARNING]
> Never commit `.env.local` or raw API credentials to Github. The project has comprehensive `.gitignore` rules in place to protect these keys.

---

## 🚀 How to Run Locally

### Start Development Server
This starts both the Express API backend and the Vite development server simultaneously:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts Reference

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs the active fullstack project locally on port 3000. |
| `npm run build` | Builds the Vite frontend & bundles the Express backend server for production. |
| `npm run start` | Executes the compiled production backend server. |
| `npm run lint` | Runs type checks across the project via `tsc --noEmit`. |
| `npm run clean` | Deletes compiled production build outputs. |

---

## 📂 Folder Structure Overview

```text
flowmind-ai/
├── dist/                  # Production compilation output (created during build)
├── assets/                # AI Studio workspace configuration data
├── src/                   # React Frontend Application
│   ├── components/        # User Interface modules (AICoach, Dashboard, FocusMode, Habits, Planner, Settings, TaskManager)
│   ├── utils/             # Helper utilities (aiHelper, demoLoader)
│   ├── App.tsx            # Main Application routing and workspace state coordinator
│   ├── main.tsx           # React bootstrap entry point
│   ├── types.ts           # Shared TypeScript interfaces
│   └── index.css          # Core design system and Tailwind directives
├── server.ts              # Express API Server and proxy for Google Gemini API
├── vite.config.ts         # Vite bundler and dev server configuration
├── tsconfig.json          # TypeScript compiler directives
├── package.json           # Application dependencies and execution scripts
├── .env.example           # Secure template file for environment setups
└── .gitignore             # Comprehensive file-exclusion rules for Git tracking
```

---

## ⚙️ AI Architecture

FlowMind AI utilizes a **Secure Server-Side API Proxy** pattern:

```mermaid
sequenceDiagram
    participant User as React Frontend
    participant Server as Express Server (server.ts)
    participant Gemini as Google Gemini API

    User->>Server: HTTP POST /api/gemini/chat { contents, mood }
    Note over Server: dotenv loads GEMINI_API_KEY from .env.local
    Server->>Gemini: Models.generateContent(gemini-3.5-flash)
    Gemini-->>Server: JSON Response with Content
    Server->>User: JSON Payload
```

1.  **Frontend Isolation**: The frontend React app never possesses the API key, making it impossible to leak credentials through browser developer tools or HTTP inspects.
2.  **Strict Schema Enforcement**: The Express backend prompts Gemini to return strictly formatted JSON objects matching custom schemas defined using the `GoogleGenAI` package's schema structure, avoiding layout-breaking output variations.

---

## 📊 Productivity & Gamification System

*   🏆 **Experience Points (XP)**: Earned based on task complexity (Easy: 10 XP, Medium: 25 XP, Hard: 50 XP).
*   🔥 **Streak Multipliers**: Maintaining daily habit streaks increases a multiplier that scales your focus XP gains.
*   🧠 **Cognitive Stress Balancing**: The AI Day Planner assesses the duration, difficulty, and quantity of your tasks. If the mental workload density crosses 85%, the system triggers an **Overload Warning** and automatically postpones lower-priority tasks.

---

## 📦 Deployment Instructions

To run this application in a production environment:

1.  **Build the Project**
    ```bash
    npm run build
    ```
    This builds the React static files into the `dist/` directory and compiles the Express backend code into `dist/server.cjs`.

2.  **Define Environment Variables**
    Configure `GEMINI_API_KEY` and `APP_URL` on your hosting platform (e.g., Heroku, Render, AWS, Google Cloud Run).

3.  **Run Production Server**
    ```bash
    npm run start
    ```
    The server will run on port `3000` (or the `PORT` specified in your environment variables), serving the static React app and handling backend API queries.

---

## 🔮 Future Roadmap

*   📅 **Calendar Integration**: Synchronize AI-generated schedules directly to Google Calendar and Microsoft Outlook.
*   👥 **Multiplayer Co-Working Nodes**: Join digital deep-work sessions with peers, sharing focus progress and habit milestones.
*   📊 **Analytics Dashboard Expansion**: Generate deeper monthly trends for procrastination levels and productivity efficiency index.
*   🔒 **End-to-End Database Sync**: Introduce encrypted cloud syncing (PostgreSQL/Supabase) to complement LocalStorage.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ✍️ Author & Project Status

*   **Author**: [Vanshmiglani007](https://github.com/Vanshmiglani007)
*   **Project Status**: Production-Ready, Version 1.0.0
