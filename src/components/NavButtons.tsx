import React from "react";
import { DashboardFace } from "./CubeNavigator";
import { Network, Globe, Box, Gamepad2, Database, Folder } from "lucide-react";

interface NavButtonsProps {
  currentFace: DashboardFace;
  onNavigate: (face: DashboardFace) => void;
}

export default function NavButtons({ currentFace, onNavigate }: NavButtonsProps) {
  const buttons: { label: string; face: DashboardFace; icon: React.ReactNode }[] = [
    { label: "137-Mesh", face: "mesh", icon: <Network className="w-4 h-4" /> },
    { label: "Twin Earth", face: "earth", icon: <Globe className="w-4 h-4" /> },
    { label: "UE5 Build", face: "ue5", icon: <Box className="w-4 h-4" /> },
    { label: "Unity Build", face: "unity", icon: <Gamepad2 className="w-4 h-4" /> },
    { label: "FiveM Live", face: "fivem", icon: <Database className="w-4 h-4" /> },
    { label: "Files", face: "files", icon: <Folder className="w-4 h-4" /> },
  ];

  return (
    <div className="h-16 bg-slate-950/80 border-t border-slate-800 flex items-center justify-center gap-4 px-4 pb-2 z-50 backdrop-blur-md">
      {buttons.map((btn) => (
        <button
          key={btn.face}
          onClick={() => onNavigate(btn.face)}
          className={`px-5 py-2 rounded-md font-mono text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
            currentFace === btn.face
              ? "bg-lucy-primary/20 text-lucy-primary shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-lucy-primary/50 scale-105"
              : "bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800 hover:text-slate-200"
          }`}
        >
          {btn.icon} {btn.label}
        </button>
      ))}
    </div>
  );
}
