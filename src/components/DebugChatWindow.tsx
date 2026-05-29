import React, { useState, useEffect, useRef } from "react";
import { emitEvent } from "../core/ipcMock";

export default function DebugChatWindow() {
  const [messages, setMessages] = useState<{ role: "lucy" | "human"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const [CustomApiKey, setCustomApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("LUCY_CUSTOM_API_KEY");
    if (savedKey) setCustomApiKey(savedKey);

    const handler = (e: any) => {
      const raw = (e as CustomEvent).detail;
      if (raw && (raw.type === "LUCY_BUILD_PROPOSAL" || raw.type === "UNITY_BUILD_PROPOSAL")) {
         setMessages(prev => [...prev, { role: "lucy", text: raw.message }]);
         setIsVisible(true);
      }
    };
    
    // Listen directly via window event mapping from our HUD
    window.addEventListener("SYSTEM.SPATIALFACE.SURFACED", handler);
    return () => window.removeEventListener("SYSTEM.SPATIALFACE.SURFACED", handler);
  }, []);

  const handleSaveKey = () => {
    localStorage.setItem("LUCY_CUSTOM_API_KEY", CustomApiKey);
    alert("Local Cloud API Override Saved");
    setShowSettings(false);
  };

  useEffect(() => {
    if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: "human", text: input }]);
    
    // Human input stays outside E.M.M.A. control — just log it
    emitEvent("HUMAN.INPUT", { source: "DEBUG_CHAT", action: input });
    
    // If human says "approve", "yes", "go", "build it" etc. → trigger execution
    if (/^(approve|yes|go|build it|execute|do it)/i.test(input.trim())) {
      emitEvent("LUCY.ACTION.APPROVED", { originalProposalId: "last-proposal", lane: "UE5", command: 'echo "Mocking local Windows Execution"' }); 
    }
    
    setInput("");
  };

  if (!isVisible) return (
     <button onClick={() => setIsVisible(true)} className="fixed bottom-6 right-6 bg-lucy-primary/20 border border-lucy-primary/50 text-lucy-primary backdrop-blur-md px-5 py-2.5 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.3)] font-mono text-xs tracking-widest font-bold z-50 hover:bg-lucy-primary/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all flex items-center gap-2 group">
         <span className="w-2 h-2 rounded-full bg-lucy-primary animate-pulse group-hover:bg-white"></span>
         DEBUG COMMS
     </button>
  );

  return (
    <div className="fixed bottom-6 right-6 w-[380px] bg-lucy-base/90 backdrop-blur-xl border border-white/10 shadow-[0_10px_50px_rgba(0,0,0,0.8)] rounded-xl z-50 flex flex-col font-mono overflow-hidden transition-all animate-in slide-in-from-bottom-5">
      <div className="bg-lucy-dark/50 p-3.5 flex justify-between items-center text-xs text-slate-300 font-bold border-b border-white/5 backdrop-blur-md">
         <span className="flex items-center gap-2 text-white glow-blue"><span className="w-1.5 h-1.5 bg-lucy-primary rounded-full animate-pulse shadow-[0_0_5px_#06b6d4]"></span> LUCY DEBUG CHAT</span>
         <div className="flex gap-4 items-center">
            <button onClick={() => setShowSettings(!showSettings)} className="text-slate-500 hover:text-white transition-colors">CONFIG</button>
            <button onClick={() => setIsVisible(false)} className="text-slate-500 hover:text-lucy-danger transition-colors">CLOSE</button>
         </div>
      </div>
      
      {showSettings ? (
        <div className="p-5 flex-1 h-[320px] overflow-y-auto flex flex-col gap-4 text-sm bg-gradient-to-b from-transparent to-lucy-dark/30">
           <h4 className="text-white text-xs font-bold uppercase tracking-widest border-b border-white/5 pb-2">Cloud Connect</h4>
           <p className="text-[11px] text-slate-400 leading-relaxed">Lucy normally operates in physical sovereign mode. If you require advanced off-site inference, supply your API key below. Otherwise, Lucy is completely unrestricted and free from cloud dependencies.</p>
           
           <div className="flex flex-col gap-2 mt-2">
             <label className="text-[10px] text-lucy-primary font-bold uppercase tracking-widest flex items-center gap-2 glow-blue">
               Custom AI API Key
             </label>
             <input 
               type="password"
               value={CustomApiKey} 
               onChange={e => setCustomApiKey(e.target.value)} 
               placeholder="sk-..." 
               className="bg-black/30 border border-white/10 text-white p-2.5 rounded-lg text-xs focus:outline-none focus:border-lucy-primary focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all"
             />
           </div>
           
           <button onClick={handleSaveKey} className="mt-2 bg-lucy-primary/10 text-lucy-primary border border-lucy-primary/30 px-3 py-2.5 rounded-lg text-xs hover:bg-lucy-primary/20 hover:border-lucy-primary transition-all uppercase tracking-widest font-bold shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              Save Config
           </button>
        </div>
      ) : (
        <div ref={chatRef} className="p-4 flex-1 h-[320px] overflow-y-auto flex flex-col gap-3 text-sm scroll-smooth">
          {messages.map((msg, i) => (
            <div key={i} className={`p-3 rounded-lg max-w-[85%] ${msg.role === "lucy" ? "bg-lucy-primary/10 text-cyan-50 border border-lucy-primary/20 self-start shadow-[0_4px_20px_rgba(6,182,212,0.1)]" : "bg-white/5 text-white border border-white/10 self-end shadow-[0_4px_20px_rgba(0,0,0,0.2)]"}`}>
              <strong className={`block text-[10px] mb-1.5 tracking-widest ${msg.role === 'lucy' ? 'text-lucy-primary' : 'text-slate-400'}`}>{msg.role === "lucy" ? "LUCY SYSTEM:" : "HUMAN OVERRIDE:"}</strong>
              <span className="leading-relaxed text-[13px]">{msg.text}</span>
            </div>
          ))}
          {messages.length === 0 && <div className="text-slate-500 text-xs italic text-center mt-12 flex flex-col items-center gap-3"><span className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center animate-pulse">🤖</span> Awaiting governed proposals...</div>}
        </div>
      )}
      
      {!showSettings && (
        <div className="p-3 bg-lucy-dark/80 border-t border-white/5 flex gap-2 backdrop-blur-md">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyDown={e => e.key === "Enter" && sendMessage()} 
            placeholder="Say 'approve' or inject command..." 
            className="flex-1 bg-black/40 border border-white/10 text-white p-2.5 rounded-lg text-xs focus:outline-none focus:border-lucy-primary focus:shadow-[0_0_10px_rgba(6,182,212,0.2)] transition-all"
          />
          <button onClick={sendMessage} className="bg-lucy-primary/10 text-lucy-primary border border-lucy-primary/30 px-4 rounded-lg text-xs hover:bg-lucy-primary/20 hover:border-lucy-primary transition-all font-bold tracking-widest uppercase">
            Send
          </button>
        </div>
      )}
    </div>
  );
}
