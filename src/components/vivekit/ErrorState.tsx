import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex-grow flex flex-col justify-center items-center text-center p-6 border border-rose-900/40 bg-rose-950/10 rounded-xl space-y-4 max-w-md mx-auto">
      
      {/* Error icon container */}
      <div className="p-3 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-1.5">
        <h4 className="text-sm font-semibold text-slate-200">Execution Error</h4>
        <p className="text-xs text-rose-300/80 leading-relaxed">
          {message || "We encountered an issue communicating with Google Gemini. Please verify your GEMINI_API_KEY in your local environment."}
        </p>
      </div>

      {/* Action Button */}
      <Button
        onClick={onRetry}
        variant="outline"
        size="sm"
        className="text-xs text-slate-300 border-slate-800 hover:text-white hover:bg-slate-900 cursor-pointer flex items-center gap-1.5 rounded-lg"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Try Again</span>
      </Button>

    </div>
  );
}
