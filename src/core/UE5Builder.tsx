import React, { useState } from "react";
import PromptInput from "../components/PromptInput";
import BuildProgress from "../components/BuildProgress";
import { Box, Play, Package, Code, Bath, AlertCircle } from "lucide-react";
import { emitEvent } from "./ipcMock";
import { UnrealCppClassGenerator, GeneratedClassData } from "./ue5/UnrealCppClassGenerator";

interface ProjectStatus {
  projectName: string;
  status: "idle" | "generating" | "compiling" | "packaging" | "ready";
  progress: number;
  output: string[];
  projectPath: string;
  generatedClasses?: GeneratedClassData[];
}

export default function UE5Builder() {
  const [project, setProject] = useState<ProjectStatus | null>(null);
  const [isCleansing, setIsCleansing] = useState<boolean>(false);
  const [cleansingResult, setCleansingResult] = useState<{success: boolean, msg: string} | null>(null);
  const [ue5Path, setUe5Path] = useState<string>("C:/Program Files/Epic Games/UE_5.4/Engine/Binaries/Win64/UnrealBuildTool.exe");

  const handleBubbleBath = async () => {
    setIsCleansing(true);
    setCleansingResult(null);
    try {
        const response = await fetch('/api/kernel/bubblebath/cleanse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workspaceId: "BLUEPRINT_FORGE_01" })
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
    initialStatus: "generating" | "compiling" | "packaging", 
    endStatus: "ready", 
    messages: string[]
  ) => {
    console.log(`[UE5Builder] --- Starting ${initialStatus} ---`);
    setProject(prev => prev ? { ...prev, status: initialStatus, progress: 0, output: [...prev.output, `--- Starting ${initialStatus} ---`] } : null);
    
    let step = 0;
    const interval = setInterval(() => {
      setProject(prev => {
        if (!prev) return null;
        if (step >= messages.length) {
          clearInterval(interval);
          console.log(`[UE5Builder] Operation complete.`);
          return { ...prev, progress: 100, status: endStatus, output: [...prev.output, "Operation complete."] };
        }
        console.log(`[UE5Builder] ${messages[step]}`);
        return {
          ...prev,
          progress: Math.floor(((step + 1) / messages.length) * 100),
          output: [...prev.output, messages[step]]
        };
      });
      step++;
    }, 800);
  };

  const handlePromptSubmit = async (prompt: string) => {
    emitEvent("HUMAN.INPUT", {
        action: "START_GENERATION",
        source: "UE5_PROMPT_INPUT",
        details: { prompt }
    });

    // Generate dummy project name from prompt
    const nameStr = prompt.replace(/[^a-zA-Z0-9]/g, '');
    const projectName = "UE5_" + (nameStr.length > 10 ? nameStr.substring(0, 10) : "Project") + "_" + Math.floor(Math.random() * 1000);
    
    const generatedClass = UnrealCppClassGenerator.generateFromUserPrompt(prompt, projectName);

    setProject({
      projectName,
      status: "generating",
      progress: 0,
      output: [`Parsing prompt: "${prompt}"...`, "Initializing Local LLM Pipeline..."],
      projectPath: `C:/Workspace/UE5/${projectName}`,
      generatedClasses: [generatedClass],
    });
    console.log(`[UE5Builder] Parsing prompt: "${prompt}"...`);
    console.log(`[UE5Builder] Initializing Local LLM Pipeline...`);

    simulateProgressUpdates("generating", "ready", [
      "Generating Project Spec from natural language...",
      "Scaffolding UE5 Folder Structure...",
      `Generating ${generatedClass.className.replace(/^[AU]/, '')}.h and .cpp...`,
      "Writing .uproject configuration...",
      "Project files written to disk."
    ]);
  };

  const handleCompile = () => {
    emitEvent("HUMAN.INPUT", {
        action: "START_BUILD_COMPILE",
        source: "UE5_BUILD_BUTTON",
        details: { project: project?.projectName, ue5Path }
    });

    if (!project) return;
    simulateProgressUpdates("compiling", "ready", [
      `Running UnrealBuildTool at ${ue5Path}...`,
      `Building ${project.projectName}Editor...`,
      "[1/15] Compile SharedPCH.Engine.ShadowErrors.cpp",
      "[5/15] Compile PlayerController.cpp",
      "[9/15] Compile Character.cpp",
      "[14/15] Link UnrealEditor-Core.lib",
      "Total time in Local executor: 4.2 seconds.",
      "Compilation successful."
    ]);
  };

  const handlePackage = () => {
    emitEvent("HUMAN.INPUT", {
        action: "START_BUILD_PACKAGE",
        source: "UE5_PACKAGE_BUTTON",
        details: { project: project?.projectName }
    });

    if (!project) return;
    simulateProgressUpdates("packaging", "ready", [
       "Running RunUAT.bat BuildCookRun...",
       "Cooking content for Windows...",
       "Building target Shipping...",
       "Packaging project...",
       "Archiving successful."
    ]);
  };

  const handleOpenEditor = () => {
    emitEvent("HUMAN.INPUT", {
        action: "OPEN_UE5_EDITOR",
        source: "UE5_OPEN_BUTTON",
        details: { project: project?.projectName }
    });
  };

  return (
    <div className="flex flex-col h-full bg-transparent p-8 gap-6 overflow-y-auto">
      <div className="flex justify-between items-end border-b border-slate-800 pb-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
             <Box className="w-8 h-8 text-lucy-primary" />
             Unreal Engine 5 <span className="font-light text-slate-400">Builder</span>
           </h2>
           <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-widest">Local LLM C++ Generation • Win64 Target</p>
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

        <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400 font-mono uppercase tracking-widest">UE5 Build Tool Path</label>
            <input 
              type="text"
              value={ue5Path}
              onChange={(e) => setUe5Path(e.target.value)}
              className="bg-slate-900 border border-slate-700/50 rounded-lg p-3 text-sm text-slate-300 font-mono outline-none focus:border-lucy-primary transition-colors"
            />
        </div>

        <PromptInput
          onSubmit={handlePromptSubmit}
          placeholder="Describe your UE5 project (e.g., 'Third-person action game with stealth AI')"
        />

        {project && <BuildProgress project={project} />}

        {project?.generatedClasses && project.status === "ready" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2">
              <Code className="w-4 h-4 text-lucy-primary" /> Generated C++ Source (LL268)
            </h3>
            {project.generatedClasses.map((cls, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-700/50 rounded-lg overflow-hidden flex flex-col bg-slate-950/50">
                  <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 text-xs font-mono text-slate-400 capitalize flex items-center justify-between">
                    <span>{cls.className.replace(/^[AU]/, '')}.h</span>
                  </div>
                  <pre className="p-4 text-[10px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">{cls.headerContent}</pre>
                </div>
                <div className="border border-slate-700/50 rounded-lg overflow-hidden flex flex-col bg-slate-950/50">
                  <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 text-xs font-mono text-slate-400 capitalize flex items-center justify-between">
                    <span>{cls.className.replace(/^[AU]/, '')}.cpp</span>
                  </div>
                  <pre className="p-4 text-[10px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">{cls.sourceContent}</pre>
                </div>
              </div>
            ))}
          </div>
        )}

        {project && (
          <div className="flex gap-4">
            <button
              onClick={handleCompile}
              disabled={project.status !== "ready"}
              className="flex-1 px-4 py-3 bg-lucy-primary/10 text-lucy-primary border border-lucy-primary/30 rounded shadow-md hover:bg-lucy-primary/20 hover:border-lucy-primary/80 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-widest"
            >
              <Code className="w-4 h-4" /> Compile Source
            </button>
            <button 
              onClick={handlePackage}
              disabled={project.status !== "ready"}
              className="flex-1 px-4 py-3 bg-lucy-accent/10 text-lucy-accent border border-lucy-accent/30 rounded shadow-md hover:bg-lucy-accent/20 hover:border-lucy-accent/80 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-widest"
            >
              <Package className="w-4 h-4" /> Package Project
            </button>
            <button 
              onClick={handleOpenEditor}
              className="flex-1 px-4 py-3 bg-slate-800 text-slate-300 border border-slate-700 rounded shadow-md hover:bg-slate-700 transition-all flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-widest"
            >
              <Play className="w-4 h-4" /> Open in UE5 Editor
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
