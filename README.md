# LucyCore AGI System OS

Welcome to the **LucyCore AGI System OS** project. This is a multi-dashboard IDE and control plane designed to simulate a highly advanced Artificial General Intelligence (AGI) orchestrator and spatial computing runtime.

## 🏗 Architecture Overview

The system is constructed with a modern web stack:
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Framer Motion for smooth animations, and Vite as the build tool.
- **Backend**: Express.js server (`src/core/src/server.ts`) acting as the API layer, equipped with WebSockets (`ws`) for real-time bidirectional communication.
- **State Management**: React state hooks with a simulated internal event bus (`src/core/ipcMock.ts`).

### Modules & Dashboards
The unified interface comprises multiple specialized dashboards:
1. **System Dashboard (`NeuroMeshDashboard`, `RuntimeManager`)**: Displays core cognitive processes and telemetry.
2. **Deep Research Kernel**: A comprehensive module for data synthesis and intelligence gathering.
3. **Twin Earth Intel (`TwinEarthDashboard`)**: Geographic and temporal analysis simulation.
4. **Build Lanes (`UE5Builder`, `FiveMBuilder`, `AssetGenerator`)**: Pipeline simulators for complex multi-engine game or asset generation tasks.
5. **File Manager**: For internal system navigation.

## 🤖 Reality Check: What's Real vs. Fake?

As a conceptual cognitive OS prototype, some components are fully functional infrastructure, while others are visually simulated stand-ins meant to represent future AGI capabilities.

### What is REAL 🟢
- **Full-stack Foundation**: The React UI, Tailwind styling, Node.js/Express server router, and static builds using Vite are real.
- **WebSocket Transport**: The server includes an active WebSocket router capable of streaming actual events to the client.
- **UI & Layouts**: Complex grid dashboards, responsive styling, and dynamic routing using a React-based spatial cube mapping logic.
- **Local Proxy Gateway**: The server has a built-in proxy designed to route traffic to a local Python cognitive mesh (e.g., `EnhancedLucyMind` on `127.0.0.1:8000`), demonstrating real integration paths for local LLMs.
- **Event Bus Architecture**: Internal application events utilize a real `EventBus` (`dataBus`) structure inside `/src/core`.

### What is SIMULATED (Fake) 🔴
- **The "AI" Engine**: Direct cognitive responses and system prompts are generated or heavily augmented by `ipcMock.ts` and `generateSimulatedLocalResponse` inside `LucyEngine.ts`.
- **Game Engine Builders**: Modifying UE5 or FiveM codebases via the dashboard simply runs `setInterval` timeout progression bars; it does *not* actually compile Unreal Engine C++ code.
- **Real-time Telemetry Load**: Node graphs mapping CPU, network strings, or memory usages in dashboards are generated through local mathematical oscillators or randomized ticks, not actual hardware readouts.
- **Terminal Responses**: Most logs and command terminal outputs within the dashboard are hardcoded arrays or randomized strings for immersion.

## 🚀 Getting Started

Since the Node environment and dependencies are already fully installed via AI Studio, we've bundled a single startup script to get you running locally on Windows machines.

### Using the Starter Script
Double click the `start.bat` file in the root directory. This will:
1. Automatically start the full-stack development server.
2. Provide a persistent process window indicating the port mappings (by default, mapping to port 3000).

*Alternatively, manual developers can run:*
```bash
npm run dev
```

## 📂 Project Structure

```text
/
├── start.bat                 # Unified startup script
├── package.json              # Project dependencies and run scripts
├── src/
│   ├── App.tsx               # Main React entry point & routing module
│   ├── index.css             # Tailwind CSS injects
│   ├── components/           # UI Elements (Buttons, Nav, Layouts)
│   │   └── dashboards/       # Specific workspace modules
│   └── core/                 # Simulated "Kernel" Logic
│       ├── LucyEngine.ts     # Core response generator and rule engine
│       ├── ipcMock.ts        # Event pipe simulating OS level inter-process comms
│       └── src/server.ts     # The actual Express Backend Server
└── backend/                  # Python sandbox hooks and mounted Python routers
```
