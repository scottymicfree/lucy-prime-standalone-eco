import React, { useEffect, useRef } from 'react';
import { SystemMessage } from '../core/types';
import { motion, AnimatePresence } from 'motion/react';

export const EventLog: React.FC<{ logs: SystemMessage[] }> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col gap-1 font-mono text-[10px]">
      <AnimatePresence initial={false}>
        {logs.map((log) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`
              p-2 rounded-sm border-l-2
              ${log.type === 'request' ? 'bg-blue-500/5 border-blue-500 text-blue-300' : ''}
              ${log.type === 'response' ? 'bg-emerald-500/5 border-emerald-500 text-emerald-300' : ''}
              ${log.type === 'event' ? 'bg-purple-500/5 border-purple-500 text-purple-300' : ''}
            `}
          >
            <div className="flex justify-between items-start mb-1 opacity-60 text-[9px]">
              <span>[{new Date(log.timestamp).toISOString().split('T')[1].slice(0, -1)}]</span>
              <span>{log.confidence ? `CF:${log.confidence.toFixed(2)}` : ''}</span>
            </div>
            
            <div className="flex items-center gap-1.5 tracking-tight font-bold">
               <span className="opacity-70">{log.source}</span>
               <span className="opacity-40">→</span>
               <span className="text-white">{log.target}</span>
               <span className="px-1 py-0.5 rounded-[2px] bg-slate-800 text-[8px] ml-auto">
                 {log.type.toUpperCase()}
               </span>
            </div>

            <div className="mt-1 opacity-80 truncate text-slate-400">
               {JSON.stringify(log.payload)}
            </div>
            
            <div className="mt-1 text-[8px] opacity-40 uppercase tracking-widest flex items-center gap-1">
               Trace: {log.trace.slice(-3).join(' > ')}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={endRef} />
    </div>
  );
};
