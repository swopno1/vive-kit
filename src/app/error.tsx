'use client';

import { useEffect } from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to our engineering monitoring system
    console.error('Unhandled Application Crash:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6">
      <div className="max-w-md w-full bg-slate-900 border border-red-900/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Neon glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col items-center text-center">
          <div className="p-4 bg-red-950/60 border border-red-500/25 rounded-full mb-6">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight mb-2">
            System Failure Detected
          </h2>
          
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            An unexpected client-side crash occurred. The security engine has halted execution to protect user state.
          </p>

          {error.message && (
            <div className="w-full bg-slate-950/60 border border-slate-800 rounded-lg p-4 mb-6 text-left">
              <span className="text-xs text-red-400 font-mono block mb-1">Diagnostic Log:</span>
              <p className="text-xs text-slate-300 font-mono break-all max-h-24 overflow-y-auto">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex gap-4 w-full">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-medium transition duration-200 text-sm"
            >
              Reload Page
            </button>
            
            <button
              onClick={() => reset()}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-medium shadow-lg hover:shadow-red-500/10 transition duration-200 text-sm flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
