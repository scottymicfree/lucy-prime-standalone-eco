import React, { useState } from "react";
import { Send, Settings } from "lucide-react";

interface PromptInputProps {
  onSubmit: (prompt: string, engine?: string) => void;
  placeholder?: string;
  engineSelector?: boolean;
  selectedEngine?: string;
}

export default function PromptInput({
  onSubmit,
  placeholder = "Describe what you want to build...",
  engineSelector = false,
  selectedEngine = "ue5",
}: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [engine, setEngine] = useState(selectedEngine);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      await onSubmit(prompt, engineSelector ? engine : undefined);
      setPrompt("");
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex gap-3 bg-lucy-dark/50 p-3 rounded-md border border-slate-700/50 backdrop-blur-sm">
      {engineSelector && (
        <select
          value={engine}
          onChange={(e) => setEngine(e.target.value)}
          className="px-3 py-2 bg-slate-900 text-slate-300 rounded border border-slate-700 outline-none focus:border-lucy-primary font-mono text-sm"
        >
          <option value="ue5">UE5</option>
          <option value="unity">Unity</option>
          <option value="fivem">FiveM</option>
          <option value="godot">Godot</option>
        </select>
      )}
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 py-2 bg-slate-900 text-slate-100 rounded border border-slate-700 outline-none focus:border-lucy-primary transition-colors font-sans text-sm placeholder:text-slate-500"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !prompt.trim()}
        className="px-6 py-2 bg-lucy-primary/20 text-lucy-primary border border-lucy-primary/50 hover:bg-lucy-primary/30 rounded font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="animate-spin w-4 h-4 border-2 border-lucy-primary border-t-transparent rounded-full" />
        ) : (
          <><Send className="w-4 h-4" /> Build</>
        )}
      </button>
    </form>
  );
}
