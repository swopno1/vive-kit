import React from 'react';
import { Button } from '../ui/button';
import { Sparkles, Loader2 } from 'lucide-react';

interface GenerateButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}

export function GenerateButton({ onClick, disabled, isLoading }: GenerateButtonProps) {
  return (
    <div className="w-full relative group">
      
      {/* Glow highlight behind the button */}
      {!disabled && !isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 rounded-2xl blur-md opacity-25 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none" />
      )}

      <Button
        type="button"
        disabled={disabled || isLoading}
        onClick={onClick}
        className="w-full relative bg-slate-100 text-slate-950 font-bold hover:bg-white hover:text-black py-6 rounded-xl border border-white/20 flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed select-none"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
            <span className="tracking-wide">Composing Response...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-violet-600 fill-violet-600 group-hover:scale-110 transition-transform" />
            <span className="tracking-wide text-sm font-bold">Generate Smart Reply</span>
          </>
        )}

        {/* Hotkey notice */}
        {!isLoading && (
          <span className="absolute right-4 text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-950/5 px-2 py-0.5 rounded border border-slate-950/10 hidden md:inline-block">
            ⌘↵
          </span>
        )}
      </Button>

    </div>
  );
}
