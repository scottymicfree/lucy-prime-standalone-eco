import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, AlertCircle } from 'lucide-react';

interface ChatInterfaceProps {
  chat: { role: 'user' | 'lucy'; text: string; timestamp: number }[];
  onSend: (text: string) => void;
  isProcessing: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ chat, onSend, isProcessing }) => {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-lucy-dark/50">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {chat.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'lucy' && (
              <div className="w-8 h-8 rounded-sm bg-lucy-primary/20 border border-lucy-primary/50 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-lucy-primary" />
              </div>
            )}
            
            <div className={`
              max-w-[80%] rounded-md p-4 text-sm leading-relaxed whitespace-pre-wrap
              ${msg.role === 'user' 
                ? 'bg-slate-800 text-slate-200 border border-slate-700' 
                : 'bg-lucy-base/60 backdrop-blur-sm border border-lucy-primary/20 text-cyan-50 shadow-[0_0_15px_rgba(6,182,212,0.05)]'}
            `}>
              {msg.text}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-sm bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-slate-400" />
              </div>
            )}
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex gap-4 justify-start">
             <div className="w-8 h-8 rounded-sm bg-lucy-accent/20 border border-lucy-accent/50 flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4 text-lucy-accent" />
              </div>
              <div className="bg-lucy-base/60 border border-lucy-accent/20 rounded-md p-4 flex items-center gap-3">
                 <div className="flex gap-1">
                   <div className="w-1.5 h-1.5 bg-lucy-accent rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                   <div className="w-1.5 h-1.5 bg-lucy-accent rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                   <div className="w-1.5 h-1.5 bg-lucy-accent rounded-full animate-bounce"></div>
                 </div>
                 <span className="text-xs text-lucy-accent tracking-widest uppercase font-mono">Cognitive DAG Executing...</span>
              </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-4 border-t border-slate-800 bg-lucy-base/80 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-lucy-primary focus:ring-1 focus:ring-lucy-primary transition-all text-slate-200 placeholder:text-slate-500 font-sans"
            placeholder="Initialize cognitive trace... (e.g. 'Status report', 'Who are you?')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="bg-lucy-primary/10 hover:bg-lucy-primary/20 text-lucy-primary border border-lucy-primary/50 px-6 rounded-sm flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500 font-mono uppercase tracking-wider justify-center">
           <AlertCircle className="w-3 h-3 text-lucy-warning" />
           Local Standalone Instance // No External APIs Connected
        </div>
      </div>
    </div>
  );
};
