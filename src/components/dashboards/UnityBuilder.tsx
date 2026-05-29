import React, { useState } from "react";
import PromptInput from "../PromptInput";
import BuildProgress from "../BuildProgress";
import { Box, Play, Package, Code } from "lucide-react";

interface ProjectStatus {
  projectName: string;
  status: "idle" | "generating" | "compiling" | "packaging" | "ready";
  progress: number;
  output: string[];
  projectPath: string;
}

export default function UnityBuilder() {
  const [project, setProject] = useState<ProjectStatus | null>(null);

  const simulateProgressUpdates = (
    initialStatus: "generating" | "compiling" | "packaging", 
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
    }, 700);
  };

  const handlePromptSubmit = async (prompt: string) => {
    const nameStr = prompt.replace(/[^a-zA-Z0-9]/g, '');
    const projectName = "Unity_" + (nameStr.length > 10 ? nameStr.substring(0, 10) : "Project") + "_" + Math.floor(Math.random() * 1000);
    
    setProject({
      projectName,
      status: "generating",
      progress: 0,
      output: [`Parsing prompt: "${prompt}"...`, "Initializing Local LLM Pipeline for C#..."],
      projectPath: `C:/Workspace/Unity/${projectName}`,
    });

    simulateProgressUpdates("generating", "ready", [
      "Generating Project Spec from natural language...",
      "Scaffolding Unity Hierarchy...",
      "Generating PlayerController.cs...",
      "Generating GameManager.cs...",
      "Setting up Unity Scenes...",
      "Updating ProjectSettings.asset...",
      "Project files written to disk."
    ]);
  };

  const handleCompile = () => {
    if (!project) return;
    simulateProgressUpdates("compiling", "ready", [
      "Running Unity command line build...",
      "Compiling Assembly-CSharp.dll",
      "No CS8600 warnings detected.",
      "Assembly compilation successful."
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-transparent p-8 gap-6 overflow-y-auto">
      <div className="flex justify-between items-end border-b border-slate-800 pb-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
             <Box className="w-8 h-8 text-lucy-success" />
             Unity 3D <span className="font-light text-slate-400">Builder</span>
           </h2>
           <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-widest">Local LLM C# Generation • Windows Target</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-6">
        <PromptInput
          onSubmit={handlePromptSubmit}
          placeholder="Describe your Unity project (e.g., '2D Roguelike with procedural generation')"
        />

        {project && <BuildProgress project={project} />}

        {project && (
          <div className="flex gap-4">
            <button
              onClick={handleCompile}
              disabled={project.status !== "ready"}
              className="flex-1 px-4 py-3 bg-lucy-success/10 text-lucy-success border border-lucy-success/30 rounded shadow-md hover:bg-lucy-success/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-widest"
            >
              <Code className="w-4 h-4" /> Build Scripts
            </button>
            <button 
              className="flex-1 px-4 py-3 bg-slate-800 text-slate-300 border border-slate-700 rounded shadow-md hover:bg-slate-700 transition-all flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-widest"
            >
              <Play className="w-4 h-4" /> Open Unity Hub
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
