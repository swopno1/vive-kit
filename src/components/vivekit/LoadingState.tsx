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

      {/* Modern Shimmering Skeletal Blocks with stagger */}
      <div className="w-full space-y-2.5">
        <div className="h-4 bg-slate-700 rounded-lg w-5/6 skeleton-shimmer" style={{animationDelay: '0s'}} />
        <div className="h-4 bg-slate-700 rounded-lg w-full skeleton-shimmer" style={{animationDelay: '0.1s'}} />
        <div className="h-4 bg-slate-700 rounded-lg w-3/4 skeleton-shimmer" style={{animationDelay: '0.2s'}} />
        <div className="h-4 bg-slate-700 rounded-lg w-4/5 skeleton-shimmer" style={{animationDelay: '0.3s'}} />
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
