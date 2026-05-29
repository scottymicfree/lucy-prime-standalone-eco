import React, { useState, useEffect } from "react";
import { Cpu, ShieldCheck, ArrowUpRight, History, GitPullRequest, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RuntimeState {
    activeVersion: string | null;
    history: string[];
}

export default function RuntimeManager() {
    const [state, setState] = useState<RuntimeState>({ activeVersion: null, history: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Mock generated versions sitting in the sandbox
    const availableVersions = ["lucy-core-v1", "lucy-core-v2", "lucy-core-v3"];

    const fetchState = async () => {
        try {
            const res = await fetch('/api/kernel/runtime/status');
            const data = await res.json();
            if (data.success) {
                setState(data.state);
            }
        } catch (e) {
            console.error("Failed to fetch runtime state", e);
        }
    };

    useEffect(() => {
        fetchState();
    }, []);

    const handleMount = async (versionId: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/kernel/runtime/mount', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ versionId })
            });
            const data = await res.json();
            if (data.success) {
                await fetchState();
            } else {
                setError(data.error);
            }
        } catch (e: any) {
            setError(e.message);
        }
        setLoading(false);
    };

    const handleRollback = async (versionId: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/kernel/runtime/rollback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ versionId })
            });
            const data = await res.json();
            if (data.success) {
                await fetchState();
            } else {
                setError(data.error);
            }
        } catch (e: any) {
            setError(e.message);
        }
        setLoading(false);
    };

    if (!state) {
        return <div className="flex items-center justify-center h-full text-slate-500 font-mono text-sm tracking-widest"><div className="animate-pulse">Loading Runtime Governance State...</div></div>;
    }

    return (
        <div className="flex flex-col h-full bg-transparent p-8 gap-6 font-mono text-sm">
            <motion.div 
               initial={{ opacity: 0, y: -20 }} 
               animate={{ opacity: 1, y: 0 }} 
               className="flex justify-between items-end border-b border-slate-800 pb-4"
            >
                <div>
                    <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3 font-sans">
                        <Cpu className="w-8 h-8 text-lucy-primary" />
                        Runtime <span className="font-light text-slate-400">Mount System</span>
                    </h2>
                    <p className="text-xs text-lucy-success mt-1 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Emma Governance Active
                    </p>
                </div>
            </motion.div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded text-xs flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}>X</button>
                </div>
            )}

            <div className="grid grid-cols-2 gap-6">
                {/* Active Runtime */}
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }} 
                   animate={{ opacity: 1, scale: 1 }} 
                   transition={{ delay: 0.1 }}
                   className="bg-slate-900 border border-lucy-primary/40 rounded-lg p-6 shadow-[0_0_20px_rgba(6,182,212,0.05)] relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-lucy-primary/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-lucy-primary/20 transition-colors" />
                    <h3 className="text-xs text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-lucy-primary" /> Active Live Instance
                    </h3>
                    {state.activeVersion ? (
                        <div>
                            <div className="text-2xl font-bold text-white mb-2">{state.activeVersion}</div>
                            <div className="text-[10px] text-lucy-primary bg-lucy-primary/10 inline-block px-2 py-1 rounded">Execution Layer Mounted</div>
                        </div>
                    ) : (
                        <div className="text-slate-500 italic">No active runtime mounted. System idling.</div>
                    )}
                </motion.div>

                {/* Available Scaffolds */}
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }} 
                   animate={{ opacity: 1, scale: 1 }} 
                   transition={{ delay: 0.2 }}
                   className="bg-slate-900 border border-slate-800 rounded-lg p-6"
                >
                    <h3 className="text-xs text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ArrowUpRight className="w-4 h-4" /> Available Scaffolds (Sandbox)
                    </h3>
                    <div className="space-y-3">
                        {availableVersions.map(v => (
                            <div key={v} className="flex justify-between items-center bg-transparent border border-slate-700 p-3 rounded hover:border-lucy-primary/50 transition-colors">
                                <span className={`${state.activeVersion === v ? 'text-lucy-primary font-bold' : 'text-slate-300'}`}>{v}</span>
                                {state.activeVersion === v ? (
                                    <span className="text-[10px] text-lucy-success">ACTIVE</span>
                                ) : (
                                    <button 
                                        onClick={() => handleMount(v)}
                                        disabled={loading}
                                        className="bg-lucy-primary/20 text-lucy-primary hover:bg-lucy-primary/40 px-3 py-1 rounded text-xs transition-colors disabled:opacity-50"
                                    >
                                        Request Mount
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* History / Rollback */}
                <motion.div 
                   initial={{ opacity: 0, y: 20 }} 
                   animate={{ opacity: 1, y: 0 }} 
                   transition={{ delay: 0.3 }}
                   className="col-span-2 bg-slate-900/50 border border-slate-800 rounded-lg p-6"
                >
                    <h3 className="text-xs text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <History className="w-4 h-4 text-slate-500" /> Version History & Rollback (<GitPullRequest className="w-3 h-3 inline translate-y-[1px]" />)
                    </h3>
                    {state.history.length === 0 ? (
                        <div className="text-slate-600 text-xs italic">No history available in Deltavault yet.</div>
                    ) : (
                        <div className="flex flex-col-reverse gap-2">
                            <AnimatePresence>
                            {state.history.map((v, i) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    key={`${v}-${i}`} 
                                    className="flex justify-between items-center p-2 border-l-2 border-slate-700 pl-4 hover:border-lucy-primary/50 hover:bg-white/5 transition-colors group"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-slate-300 group-hover:text-white transition-colors">{v}</span>
                                        <span className="text-[9px] text-slate-500 group-hover:text-slate-400">Mounted sequentially at T-{state.history.length - i}</span>
                                    </div>
                                    {state.activeVersion !== v && (
                                        <button 
                                            onClick={() => handleRollback(v)}
                                            disabled={loading}
                                            className="text-[10px] text-orange-400 border border-orange-500/30 px-3 py-1.5 rounded hover:bg-orange-500 hover:text-white transition-all disabled:opacity-50"
                                        >
                                            Rollback System
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
