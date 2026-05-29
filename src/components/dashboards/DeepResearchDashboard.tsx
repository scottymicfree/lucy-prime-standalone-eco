import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Play, Activity } from 'lucide-react';
import { ipcRenderer, emitEvent } from '../../core/ipcMock';

export function DeepResearchDashboard() {
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState<'quick' | 'standard' | 'deep' | 'ultradeep'>('standard');
  const [exportFormat, setExportFormat] = useState<'md' | 'pdf'>('md');
  const [status, setStatus] = useState<string>('IDLE');
  const [logs, setLogs] = useState<string[]>([]);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const fnPhase = (e: any, payload?: any) => {
      // IPC structure usually passes (event, args). Assume 'payload' or fallback
      const data = payload || e.payload || e.detail;
      setLogs(prev => [...prev, `[PHASE CHANGE] ${data.phase}: ${data.status}`]);
      setStatus(`PHASE: ${data.phase}`);
    };
    const fnComplete = (e: any, payload?: any) => {
      const data = payload || e.payload || e.detail;
      setLogs(prev => [...prev, `[COMPLETE] Report generated at ${data.outputLocation}`]);
      setStatus('COMPLETE');
      setReportUrl(data.outputLocation);
    };

    ipcRenderer.on("DEEP_RESEARCH.PHASE_CHANGE", fnPhase);
    ipcRenderer.on("DEEP_RESEARCH.COMPLETE", fnComplete);

    return () => {
      ipcRenderer.removeListener("DEEP_RESEARCH.PHASE_CHANGE", fnPhase);
      ipcRenderer.removeListener("DEEP_RESEARCH.COMPLETE", fnComplete);
    };
  }, []);

  const handleLaunch = async () => {
    if (!topic.trim()) return;
    setLogs([`Initiating deep research for "${topic}" at depth: ${depth}`]);
    setStatus('STARTING...');
    setReportUrl(null);
    
    emitEvent('USER.INVOKE_DEEP_RESEARCH', {
      topic,
      depth,
      exportFormat,
      timestamp: Date.now()
    });

    try {
      await fetch('/api/research/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `Research ${topic}`, reportTopic: topic, depth, exportFormat })
      });
    } catch (err: any) {
      setLogs(prev => [...prev, `[ERROR] ${err.message}`]);
      setStatus('ERROR');
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent p-8 gap-6 font-mono text-sm overflow-y-auto w-full">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between border-b border-white/5 pb-4">
        <div>
           <h2 className="text-2xl font-bold text-white flex items-center gap-3 glow-blue">
             <Search className="w-6 h-6 text-lucy-primary" />
             Deep Research Kernel
           </h2>
           <p className="text-slate-400 mt-2 tracking-widest text-[11px] uppercase">Node LL355 // Citation-backed Enterprise Intelligence</p>
        </div>
      </motion.div>

      <div className="flex gap-6 mt-4">
        <div className="w-[45%] flex flex-col gap-4">
          <div className="bg-lucy-base/30 border border-white/10 p-5 rounded-xl backdrop-blur-xl flex flex-col gap-4">
            <h3 className="text-lucy-primary font-bold uppercase tracking-widest text-xs flex gap-2 items-center">
               <Activity className="w-4 h-4" /> Parameters
            </h3>
            
            <label className="text-xs text-slate-300">Target Topic / Research Query</label>
            <input 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Next-Generation AI Safety Architectures"
              className="bg-black/50 border border-white/10 p-3 rounded-lg text-white focus:outline-none focus:border-lucy-primary"
            />

            <label className="text-xs text-slate-300 mt-2">Analytical Depth</label>
            <div className="grid grid-cols-2 gap-2">
              {['quick', 'standard', 'deep', 'ultradeep'].map(d => (
                 <button 
                   key={d}
                   onClick={() => setDepth(d as any)}
                   className={`p-2 rounded-lg border text-xs tracking-widest uppercase transition-all ${depth === d ? 'bg-lucy-primary/20 border-lucy-primary text-lucy-primary glow-blue font-bold shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'bg-transparent border-white/10 text-slate-400 hover:border-lucy-primary/50 hover:text-white'}`}
                 >
                   {d}
                 </button>
              ))}
            </div>

            <label className="text-xs text-slate-300 mt-2">Export Format</label>
            <div className="grid grid-cols-2 gap-2">
              {['md', 'pdf'].map(f => (
                 <button 
                   key={f}
                   onClick={() => setExportFormat(f as any)}
                   className={`p-2 rounded-lg border text-xs tracking-widest uppercase transition-all ${exportFormat === f ? 'bg-lucy-primary/20 border-lucy-primary text-lucy-primary glow-blue font-bold shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'bg-transparent border-white/10 text-slate-400 hover:border-lucy-primary/50 hover:text-white'}`}
                 >
                   {f === 'md' ? 'Markdown' : 'PDF'}
                 </button>
              ))}
            </div>

            <button
               onClick={handleLaunch}
               className="mt-4 bg-lucy-primary/10 text-lucy-primary border border-lucy-primary/30 py-3 rounded-lg uppercase tracking-widest font-bold hover:bg-lucy-primary/20 hover:border-lucy-primary transition-all flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.15)] glow-blue"
            >
               <Play className="w-4 h-4 fill-current" /> Execute Synthesis
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4">
           {/* Telemetry output */}
           <div className="bg-lucy-dark/50 border border-white/10 p-5 rounded-xl backdrop-blur-xl h-[400px] flex flex-col">
              <h3 className="text-lucy-accent font-bold uppercase tracking-widest text-xs flex gap-2 items-center mb-4 glow-purple border-b border-white/5 pb-2">
                 <FileText className="w-4 h-4" /> Telemetry & Outline Traces
                 <span className="ml-auto text-[10px] text-slate-400">{status}</span>
              </h3>
              
              <div className="flex-1 overflow-y-auto text-[11px] font-mono whitespace-pre-wrap text-slate-300 space-y-2 custom-scrollbar">
                {logs.length === 0 ? (
                  <span className="text-slate-500 italic">Awaiting kernel activation...</span>
                ) : (
                  logs.map((L, i) => (
                    <div key={i} className="flex gap-2">
                       <span className="text-slate-500">[{new Date().toISOString().substring(11,19)}]</span>
                       <span className={L.includes('ERROR') ? 'text-lucy-danger' : L.includes('COMPLETE') ? 'text-lucy-success glow-green font-bold' : L.includes('PHASE') ? 'text-lucy-primary' : ''}>{L}</span>
                    </div>
                  ))
                )}
              </div>

              {reportUrl && (
                <div className="mt-4 p-3 bg-lucy-success/10 border border-lucy-success/30 rounded flex justify-between items-center animate-in fade-in zoom-in">
                  <span className="text-lucy-success font-bold text-xs tracking-widest glow-green">REPORT ASSEMBLED</span>
                  <span className="text-xs text-slate-300 truncate max-w-[200px]">{reportUrl.split('/').pop()}</span>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
