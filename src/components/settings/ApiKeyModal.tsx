'use client';

import React, { useState, useEffect } from 'react';
import { X, KeyRound } from 'lucide-react';
import { ApiKeySettings } from './ApiKeySettings';
import { getUserAIConfig, UserAIConfig } from '../../lib/user-ai-config';

interface ApiKeyModalProps {
  open: boolean;
  onClose: () => void;
  onConfigChange?: (config: UserAIConfig | null) => void;
}

export function ApiKeyModal({ open, onClose, onConfigChange }: ApiKeyModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-600/15 ring-1 ring-violet-500/20">
              <KeyRound className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">AI Provider Settings</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Use your own API key — ViveKit is free, forever.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">
          <ApiKeySettings onChange={(cfg) => { onConfigChange?.(cfg); }} />
        </div>
      </div>
    </div>
  );
}
