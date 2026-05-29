import React, { useState, useEffect, useRef } from "react";
import { Server, Terminal, CheckCircle, AlertCircle, PlayCircle, Info, ChevronRight, Clock } from "lucide-react";

interface BuildProgressProps {
  project: {
    projectName: string;
    status: string;
    progress: number;
    output: string[];
  };
}

interface LogEntry {
  message: string;
  timestamp: Date;
  id: number;
}

export default function BuildProgress({ project }: BuildProgressProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     setLogs(prev => {
        if (!project.output || project.output.length === 0) return [];
        
        // If it looks like a reset
        if (project.output.length < prev.length || (prev.length > 0 && prev[0].message !== project.output[0])) {
            return project.output.map((msg, i) => ({ id: Date.now() + i, message: msg, timestamp: new Date() }));
        }

        // Append new output
        const newLogs = [...prev];
        for (let i = prev.length; i < project.output.length; i++) {
           newLogs.push({ id: Date.now() + i, message: project.output[i], timestamp: new Date() });
        }
        return newLogs;
     });
  }, [project.output]);

  useEffect(() => {
      if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [logs]);

  const getLogIcon = (msg: string) => {
      const lower = msg.toLowerCase();
      if (lower.includes('error') || lower.includes('fail')) return <AlertCircle className="w-3 h-3 text-red-400" />;
      if (lower.includes('start') || lower.includes('run') || lower.includes('initialize')) return <PlayCircle className="w-3 h-3 text-blue-400" />;
      if (lower.includes('complete') || lower.includes('success')) return <CheckCircle className="w-3 h-3 text-emerald-400" />;
      if (msg.startsWith('[')) return <Terminal className="w-3 h-3 text-slate-500" />;
      return <ChevronRight className="w-3 h-3 text-slate-500" />;
  };

  const getLogColor = (msg: string) => {
      const lower = msg.toLowerCase();
      if (lower.includes('error') || lower.includes('fail')) return 'text-red-400';
      if (lower.includes('complete') || lower.includes('success')) return 'text-emerald-400 font-bold';
      if (lower.includes('---')) return 'text-lucy-primary font-bold';
      return 'text-slate-300';
  };

  // Calculate elapsed time if complete
  const elapsedSeconds = logs.length > 1 
    ? ((logs[logs.length - 1].timestamp.getTime() - logs[0].timestamp.getTime()) / 1000).toFixed(1)
    : "0.0";

  return (
    <div className="bg-lucy-base/40 border border-slate-700/50 p-4 rounded-md space-y-4 backdrop-blur-sm">
      <div className="flex justify-between items-center text-sm">
        <span className="font-semibold text-slate-200 flex items-center gap-2">
           <Server className="w-4 h-4 text-lucy-accent" />
           {project.projectName}
        </span>
        <div className="flex gap-3">
            {project.status === "ready" && (
                <span className="px-2 py-0.5 bg-slate-800/50 border border-slate-700 rounded-sm font-mono text-[10px] text-slate-400 flex items-center gap-1.5">
                   <Clock className="w-3 h-3" /> {elapsedSeconds}s
                </span>
            )}
            <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-sm font-mono text-[10px] uppercase text-lucy-primary tracking-widest flex items-center gap-1.5">
               {project.status === "ready" && <CheckCircle className="w-3 h-3 text-lucy-success" />}
               {project.status}
            </span>
        </div>
      </div>

      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${project.progress === 100 ? 'bg-lucy-success glow-green' : 'bg-lucy-primary glow-blue'}`}
          style={{ width: `${project.progress}%` }}
        />
      </div>

      <div 
        ref={scrollRef}
        className="bg-[#0a0f18] p-3 rounded-sm border border-slate-800 h-48 overflow-y-auto font-mono text-[10px] custom-scrollbar flex flex-col gap-1.5"
      >
        <div className="text-slate-500 mb-2 flex items-center gap-2 pb-2 border-b border-slate-800/50">
           <Terminal className="w-3 h-3" /> System Trace Log
        </div>
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2 items-start break-all opacity-80 hover:opacity-100 transition-opacity">
            <span className="text-slate-600 shrink-0 select-none">[{log.timestamp.toLocaleTimeString(undefined, { hour12: false, fractionalSecondDigits: 3 })}]</span> 
            <span className="shrink-0 mt-0.5">{getLogIcon(log.message)}</span>
            <span className={getLogColor(log.message)}>{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
