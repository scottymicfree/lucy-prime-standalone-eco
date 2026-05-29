import React, { useState } from "react";
import { emitEvent } from "../core/ipcMock";
import { Network, Globe, Box, Gamepad2, Database, Folder, Cpu, Search, ClipboardList, Activity } from 'lucide-react';

const modules = [
  { id: "DASHBOARD", label: "System Dashboard", icon: <Activity className="w-8 h-8" /> },
  { id: "EARTH", label: "Twin Earth Intel", icon: <Globe className="w-8 h-8" /> },
  { id: "UE5", label: "UE5 Build Lane", icon: <Box className="w-8 h-8" /> },
  { id: "UNITY", label: "Unity Lane", icon: <Gamepad2 className="w-8 h-8" /> },
  { id: "FIVEM", label: "FiveM Live", icon: <Database className="w-8 h-8" /> },
  { id: "EMMA", label: "137-Mesh (E.M.M.A)", icon: <Network className="w-8 h-8" /> },
  { id: "TASKS", label: "Task Manager", icon: <ClipboardList className="w-8 h-8" /> },
  { id: "FILES", label: "Mesh Builder", icon: <Folder className="w-8 h-8" /> },
  { id: "RUNTIME", label: "Runtime Control", icon: <Cpu className="w-8 h-8" /> },
  { id: "RESEARCH", label: "Deep Research", icon: <Search className="w-8 h-8" /> },
  { id: "ASSETS", label: "Asset Generator", icon: <div className="relative"><Box className="w-8 h-8" /><span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lucy-primary opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-lucy-primary"></span></span></div> },
];

export const MainControlCenter: React.FC = () => {
  const [currentModule, setCurrentModule] = useState("HOME");

  const handleSelect = (moduleId: string) => {
    setCurrentModule(moduleId);
    emitEvent("USER.SELECT.MODULE", { module: moduleId, timestamp: Date.now() });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-lucy-dark text-slate-100 p-8 relative overflow-hidden z-0">
      {/* Background Mesh */}
      <div className="absolute inset-0 z-[-2] bg-gradient-to-br from-[#020617] to-[#0f172a] pointer-events-none" />
      <div className="absolute inset-0 z-[-1] opacity-[0.03] bg-[linear-gradient(#06b6d4_1px,transparent_1px),linear-gradient(90deg,#06b6d4_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      
      {/* Ambient Glows */}
      <div className="absolute top-1/2 left-[20%] -translate-y-1/2 w-[500px] h-[500px] bg-lucy-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/2 left-[80%] translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-lucy-accent/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="text-center mb-16 relative z-10 space-y-4">
        <h1 className="text-5xl font-display font-medium tracking-tight text-white drop-shadow-sm glow-blue">
          Lucy Command Center
        </h1>
        <p className="text-lucy-primary font-mono tracking-widest text-xs uppercase flex items-center justify-center gap-3 bg-lucy-primary/5 border border-lucy-primary/20 px-6 py-2 rounded-full w-max mx-auto shadow-inner shadow-lucy-primary/10">
          <span className="w-2 h-2 rounded-full bg-lucy-success animate-pulse inline-block shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          Sovereign Mode • Governed Spines
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl relative z-10">
        {modules.map(mod => (
          <button
            key={mod.id}
            onClick={() => handleSelect(mod.id)}
            className={`group relative flex flex-col items-center justify-center gap-4 p-8 min-h-[180px] rounded-2xl border transition-all duration-300 overflow-hidden
              ${currentModule === mod.id 
                ? "bg-lucy-base border-lucy-primary shadow-[0_0_30px_rgba(6,182,212,0.15)] scale-[1.02]" 
                : "bg-lucy-base/50 border-slate-800/80 shadow-2xl hover:border-lucy-primary/40 hover:bg-slate-900/80"}`}
          >
            {/* Hover flare */}
            <div className={`absolute inset-0 bg-gradient-to-t from-lucy-primary/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${currentModule === mod.id && 'from-lucy-primary/10 opacity-100'}`} />
            
            <div className={`${currentModule === mod.id ? "text-lucy-primary scale-110 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-pulse-node" : "text-slate-400 group-hover:text-lucy-primary"} transition-all duration-300`}>
              {mod.icon}
            </div>
            
            <span className={`font-mono font-medium tracking-widest uppercase text-[11px] mt-2 transition-all ${currentModule === mod.id ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" : "text-slate-400 group-hover:text-slate-200"}`}>
              {mod.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MainControlCenter;
