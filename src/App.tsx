import React, { useState, useEffect } from 'react';
import { ipcRenderer } from './core/ipcMock';
import MainControlCenter from './components/MainControlCenter';
import { TwinEarthDashboard } from './components/TwinEarthDashboard';
import UE5Builder from './core/UE5Builder';
import UnityBuilder from './components/dashboards/UnityBuilder';
import FiveMBuilder from './components/dashboards/FiveMBuilder';
import NeuroMeshDashboard from './components/dashboards/NeuroMeshDashboard';
import FileManager from './components/dashboards/FileManager';
import RuntimeManager from './components/dashboards/RuntimeManager';
import { DeepResearchDashboard } from './components/dashboards/DeepResearchDashboard';
import TaskList from './components/dashboards/TaskList';
import AssetGenerator from './components/dashboards/AssetGenerator';
import SystemDashboard from './components/SystemDashboard';
import { ArrowLeft, Music, Music2, Search } from 'lucide-react';
import DebugChatWindow from './components/DebugChatWindow';
import { 
  playQuantumTrack, 
  stopQuantumTrack, 
  setMoodState, 
  injectEntropy, 
  getCurrentMusicState 
} from './core/lucy.quantum.music.engine';

export default function App() {
  const [activeDashboard, setActiveDashboard] = useState<"HOME" | string>("HOME");
  const [spatialAlert, setSpatialAlert] = useState<{title: string, message: string} | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  useEffect(() => {
    // --- Entropy Engine Hooks ---
    const handleActivity = () => injectEntropy(0.005);
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    const handler = (_: any, proposal: any) => {
      if (proposal.type === "DASHBOARD_FLIP") {
        setActiveDashboard(proposal.module);
        setMoodState('exploration'); 
        injectEntropy(0.2);
      }
    };
    
    // Spatial Face Surfacing Listener
    const spatialHandler = (e: any) => {
       const raw = (e as CustomEvent).detail;
       if (raw && raw.title) {
          setSpatialAlert({ title: raw.title, message: raw.message });
          
          // Music Engine integration
          if (raw.message.includes("Failed") || raw.message.includes("Error")) {
             setMoodState('tension');
             injectEntropy(0.5);
          } else if (raw.message.includes("success") || raw.message.includes("approved")) {
             setMoodState('focus');
             injectEntropy(0.2);
          } else if (raw.title.includes("Earth")) {
             setMoodState('chaos'); 
             injectEntropy(0.4);
          }

          setTimeout(() => setSpatialAlert(null), 5000); // clear after 5s
       }
    };
    
    ipcRenderer.on("SYSTEM.DASHBOARD.FLIP", handler);
    window.addEventListener("SYSTEM.SPATIALFACE.SURFACED", spatialHandler);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      ipcRenderer.removeListener("SYSTEM.DASHBOARD.FLIP", handler);
      window.removeEventListener("SYSTEM.SPATIALFACE.SURFACED", spatialHandler);
    }
  }, []);

  const toggleMusic = async () => {
    if (isMusicPlaying) {
      stopQuantumTrack();
      setIsMusicPlaying(false);
    } else {
      await playQuantumTrack();
      setIsMusicPlaying(true);
    }
  };

  const TopBar = () => (
    <div className="bg-[#020617]/80 backdrop-blur-md border-b border-white/5 p-3 flex items-center shadow-[0_4px_30px_rgba(0,0,0,0.5)] relative z-50">
       <button 
         onClick={() => setActiveDashboard("HOME")}
         className="flex items-center gap-2 text-slate-400 hover:text-white font-mono text-[11px] uppercase tracking-widest px-4 py-2 hover:bg-white/5 rounded-full transition-all"
       >
         <ArrowLeft className="w-4 h-4" /> Command Center
       </button>
       
       <button 
         onClick={() => setActiveDashboard("RESEARCH")}
         className={`ml-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest px-4 py-2 hover:bg-white/5 rounded-full transition-all ${activeDashboard === 'RESEARCH' ? 'text-lucy-primary bg-lucy-primary/10' : 'text-slate-400 hover:text-white'}`}
       >
         <Search className="w-4 h-4" /> Deep Research
       </button>
       
       <button 
         onClick={toggleMusic}
         className={`ml-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest px-4 py-2 rounded-full transition-all ${isMusicPlaying ? 'bg-lucy-primary/10 text-lucy-primary shadow-[inset_0_0_10px_rgba(6,182,212,0.2)]' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
         title="Toggle Adaptive Quantum Audio"
       >
         {isMusicPlaying ? <Music className="w-4 h-4 animate-pulse" /> : <Music2 className="w-4 h-4" />}
         Audio
       </button>

       {/* HUD FOR SPATIAL ALERTS */}
       {spatialAlert && (
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center animate-pulse gap-3 bg-lucy-primary/10 border border-lucy-primary/30 px-6 py-2 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] backdrop-blur-xl">
             <span className="font-bold text-xs font-mono text-white tracking-widest uppercase glow-blue">{spatialAlert.title}</span>
             <span className="text-[10px] font-mono text-lucy-primary">{spatialAlert.message}</span>
          </div>
       )}

       <span className="ml-auto px-4 font-mono text-[10px] text-lucy-success/80 flex items-center gap-2 tracking-widest">
         <span className="w-1.5 h-1.5 bg-lucy-success rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
         AUDIT LOGGED & GOVERNED 
       </span>
    </div>
  );

  const renderDashboard = () => {
    switch (activeDashboard) {
      case "EARTH": return <div className="flex flex-col h-screen"><TopBar /><div className="flex-1 overflow-hidden"><TwinEarthDashboard /></div></div>;
      case "UE5": return <div className="flex flex-col h-screen"><TopBar /><div className="flex-1 overflow-hidden"><UE5Builder /></div></div>;
      case "UNITY": return <div className="flex flex-col h-screen"><TopBar /><div className="flex-1 overflow-hidden"><UnityBuilder /></div></div>;
      case "FIVEM": return <div className="flex flex-col h-screen"><TopBar /><div className="flex-1 overflow-hidden"><FiveMBuilder /></div></div>;
      case "EMMA": return <div className="flex flex-col h-screen"><TopBar /><div className="flex-1 overflow-hidden"><NeuroMeshDashboard /></div></div>;
      case "FILES": return <div className="flex flex-col h-screen"><TopBar /><div className="flex-1 overflow-hidden"><FileManager /></div></div>;
      case "TASKS": return <div className="flex flex-col h-screen"><TopBar /><div className="flex-1 overflow-hidden"><TaskList /></div></div>;
      case "RUNTIME": return <div className="flex flex-col h-screen"><TopBar /><div className="flex-1 overflow-hidden"><RuntimeManager /></div></div>;
      case "RESEARCH": return <div className="flex flex-col h-screen"><TopBar /><div className="flex-1 overflow-hidden"><DeepResearchDashboard /></div></div>;
      case "ASSETS": return <div className="flex flex-col h-screen"><TopBar /><div className="flex-1 overflow-hidden"><AssetGenerator /></div></div>;
      case "DASHBOARD": return <div className="flex-1 w-full h-screen overflow-hidden"><SystemDashboard /></div>;
      default: return <MainControlCenter />;
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden relative">
      {renderDashboard()}
      <DebugChatWindow />
    </div>
  );
}
