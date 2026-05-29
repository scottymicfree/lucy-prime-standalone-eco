import React, { useState, useEffect } from "react";
import PromptInput from "../PromptInput";
import BuildProgress from "../BuildProgress";
import { Server, Code, RefreshCcw, Bath, AlertCircle } from "lucide-react";

interface ProjectStatus {
  projectName: string;
  status: "idle" | "generating" | "deploying" | "ready";
  progress: number;
  output: string[];
  projectPath: string;
}

export default function FiveMBuilder() {
  const [project, setProject] = useState<ProjectStatus | null>(null);
  const [isCleansing, setIsCleansing] = useState<boolean>(false);
  const [cleansingResult, setCleansingResult] = useState<{success: boolean, msg: string} | null>(null);

  const handleBubbleBath = async () => {
    setIsCleansing(true);
    setCleansingResult(null);
    try {
        const response = await fetch('/api/kernel/bubblebath/cleanse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workspaceId: "FIVEM_FORGE_01" })
        });
        const data = await response.json();
        
        if (data.success) {
            setCleansingResult({ success: true, msg: "Workspace cleansed. Ready for new build." });
        } else {
            setCleansingResult({ success: false, msg: data.error || "ActionEngine denied cleansing." });
        }
    } catch (e: any) {
        setCleansingResult({ success: false, msg: e.message });
    }
    setIsCleansing(false);
  };


  const simulateProgressUpdates = (
    initialStatus: "generating" | "deploying", 
    endStatus: "ready", 
    messages: string[]
  ) => {
    setProject(prev => prev ? { ...prev, status: initialStatus, progress: 0, output: [...prev.output, `--- Starting ${initialStatus} ---`] } : null);
    
    let step = 0;
    const interval = setInterval(() => {
      setProject(prev => {
        if (!prev) return null;
        if (step >= messages.length) {
          clearInterval(interval);
          return { ...prev, progress: 100, status: endStatus, output: [...prev.output, "Operation complete."] };
        }
        return {
          ...prev,
          progress: Math.floor(((step + 1) / messages.length) * 100),
          output: [...prev.output, messages[step]]
        };
      });
      step++;
    }, 600);
  };

  const handlePromptSubmit = async (prompt: string) => {
    const nameStr = prompt.replace(/[^a-zA-Z0-9]/g, '');
    const projectName = "esx_" + (nameStr.length > 10 ? nameStr.substring(0, 10) : "resource");
    
    setProject({
      projectName,
      status: "generating",
      progress: 0,
      output: [`Parsing prompt: "${prompt}"...`, "Initializing Local LLM Pipeline for Lua..."],
      projectPath: `C:/FXServer/resources/[local]/${projectName}`,
    });

    simulateProgressUpdates("generating", "ready", [
      "Generating fxmanifest.lua...",
      "Scaffolding server/main.lua...",
      "Scaffolding client/main.lua...",
      "Generating NUI HTML/JS/CSS structure...",
      "Validating FXServer dependencies...",
      "Resource created successfully."
    ]);
  };

  const handleDeploy = () => {
    if (!project) return;
    simulateProgressUpdates("deploying", "ready", [
      "Connecting to local FXServer RCON...",
      `Sending command: refresh`,
      `Sending command: ensure ${project.projectName}`,
      "Resource successfully injected to running server."
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-transparent p-8 gap-6 overflow-y-auto">
      <div className="flex justify-between items-end border-b border-slate-800 pb-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
             <Server className="w-8 h-8 text-orange-500" />
             FiveM <span className="font-light text-slate-400">Resource Builder</span>
           </h2>
           <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-widest">Local LLM Lua Generation • FXServer Target</p>
        </div>
        <div>
           <button 
               onClick={handleBubbleBath}
               disabled={isCleansing}
               className="bg-lucy-primary/10 text-lucy-primary border border-lucy-primary/30 px-4 py-2 rounded-lg text-xs uppercase tracking-widest font-bold hover:bg-lucy-primary/20 hover:border-lucy-primary transition-all flex items-center gap-2 group shadow-[0_0_15px_rgba(6,182,212,0.15)] disabled:opacity-50"
           >
               <Bath className={`w-4 h-4 ${isCleansing ? 'animate-pulse' : ''}`} /> 
               {isCleansing ? 'Cleansing Workspace...' : 'Bubble Bath (Identity Core)'}
           </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-6">
        {cleansingResult && (
           <div className={`p-4 border rounded font-mono text-xs uppercase tracking-widest flex items-center gap-3 ${cleansingResult.success ? 'bg-lucy-success/10 border-lucy-success/30 text-lucy-success' : 'bg-lucy-danger/10 border-lucy-danger/30 text-lucy-danger'}`}>
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{cleansingResult.msg}</span>
           </div>
        )}

        <PromptInput
          onSubmit={handlePromptSubmit}
          placeholder="Describe your FiveM script (e.g., 'A robbery script using ESX with a minigame UI')"
        />

        {project && <BuildProgress project={project} />}

        {project && (
          <div className="flex gap-4">
            <button
              onClick={handleDeploy}
              disabled={project.status !== "ready"}
              className="flex-1 px-4 py-3 bg-orange-500/10 text-orange-500 border border-orange-500/30 rounded shadow-md hover:bg-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-widest"
            >
              <RefreshCcw className="w-4 h-4" /> Live Inject to FXServer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
