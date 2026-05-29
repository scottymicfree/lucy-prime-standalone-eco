import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Play, Download, Loader2, Sparkles, Box } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export default function AssetGenerator() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is missing.");
      }
      
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: prompt }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any
          }
        }
      });
      
      let foundImage = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
           const base64EncodeString = part.inlineData.data;
           const mimeType = part.inlineData.mimeType || "image/png";
           foundImage = `data:${mimeType};base64,${base64EncodeString}`;
           break;
        }
      }
      
      if (foundImage) {
        setGeneratedImage(foundImage);
      } else {
        throw new Error("No image data returned from API.");
      }
    } catch (err: any) {
      console.error("Asset generation error:", err);
      setError(err.message || "Failed to generate image.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200">
      <header className="flex items-center justify-between border-b border-slate-800 p-6 shrink-0 bg-slate-900/40">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-white">
            <Sparkles className="w-6 h-6 text-lucy-primary" />
            AI Asset Generator
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1 uppercase tracking-widest">
            Create contextual placeholders and thematic UI visuals
          </p>
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left Panel: Configuration */}
        <div className="w-full md:w-1/3 border-r border-slate-800 bg-slate-900/30 p-6 overflow-y-auto">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <Box className="w-4 h-4 text-lucy-primary" /> Prompt Description
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A serene mountain landscape at golden hour, photorealistic, suitable for a hero banner..."
                className="w-full h-40 bg-slate-950 border border-slate-700/50 rounded-lg p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-lucy-primary/50 transition-colors resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2 block">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['1:1', '4:3', '16:9', '9:16', '3:4'].map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-2 rounded-md border text-xs font-mono transition-colors ${
                      aspectRatio === ratio
                        ? 'bg-lucy-primary/20 border-lucy-primary text-white shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateImage}
              disabled={!prompt.trim() || isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-lucy-primary hover:bg-cyan-300 text-slate-950 font-bold py-4 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.2)] md:transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 uppercase tracking-widest text-xs"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> GENERATING...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" /> GENERATE ASSET
                </>
              )}
            </button>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-4 rounded-lg font-mono overflow-hidden break-words"
                >
                  ERROR: {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Panel: Preview */}
        <div className="w-full md:w-2/3 p-8 flex items-center justify-center bg-[#020617] relative bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_60%)]">
          <div className="absolute inset-0 z-0 opacity-10 bg-[linear-gradient(#334155_1px,transparent_1px),linear-gradient(90deg,#334155_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

          <div className="relative z-10 w-full max-w-2xl aspect-video max-h-full flex items-center justify-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/50 overflow-hidden shadow-2xl backdrop-blur-sm">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-4 text-lucy-primary">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="font-mono text-xs uppercase tracking-widest opacity-80">Synthesizing Visuals...</span>
              </div>
            ) : generatedImage ? (
              <div className="relative w-full h-full group">
                <img
                  src={generatedImage}
                  alt="Generated Asset"
                  className="w-full h-full object-contain bg-slate-950"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <a
                    href={generatedImage}
                    download={`asset-${Date.now()}.png`}
                    className="flex items-center gap-2 bg-lucy-primary text-slate-950 font-bold px-6 py-3 rounded-lg hover:scale-105 transition-transform"
                  >
                    <Download className="w-5 h-5" /> Download Asset
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-slate-600">
                <ImageIcon className="w-12 h-12 opacity-20" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-center max-w-xs">
                  Generated assets will appear here. Configure parameters on the left.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
