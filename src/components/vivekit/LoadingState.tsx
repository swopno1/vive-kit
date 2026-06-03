import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="flex-1 flex flex-col justify-center items-start p-6 border border-slate-800 bg-slate-950/20 rounded-xl space-y-4 select-none">
      
      {/* Loading message header */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-spin" />
        <span>ViveKit AI is drafting client reply...</span>
      </div>

      {/* Modern Shimmering Skeletal Blocks */}
      <div className="w-full space-y-2.5 animate-pulse">
        <div className="h-4 bg-slate-850 rounded-lg w-5/6" />
        <div className="h-4 bg-slate-850 rounded-lg w-full" />
        <div className="h-4 bg-slate-850 rounded-lg w-3/4" />
        <div className="h-4 bg-slate-850 rounded-lg w-4/5" />
      </div>

      {/* Pulsing dots indicator */}
      <div className="flex items-center gap-1.5 pt-2">
        <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce-load" style={{animationDelay: '0s'}} />
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce-load" style={{animationDelay: '0.15s'}} />
        <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce-load" style={{animationDelay: '0.3s'}} />
      </div>

    </div>
  );
}
