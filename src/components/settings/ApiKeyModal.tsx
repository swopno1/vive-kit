'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, KeyRound } from 'lucide-react';
import { ApiKeySettings } from './ApiKeySettings';
import { UserAIConfig } from '../../lib/user-ai-config';

interface ApiKeyModalProps {
  open: boolean;
  onClose: () => void;
  onConfigChange?: (config: UserAIConfig | null) => void;
}

export function ApiKeyModal({ open, onClose, onConfigChange }: ApiKeyModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-label="AI Provider Settings"
    >
      {/* Backdrop — click to close */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — centered, above backdrop */}
      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-lg bg-slate-950 border border-slate-800/80 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Violet glow strip at top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="ViveKit"
              width={32}
              height={32}
              className="rounded-lg shrink-0 shadow-md"
            />
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
                AI Provider Settings
                <KeyRound className="w-3.5 h-3.5 text-violet-400" />
              </h2>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Use your own API key — ViveKit is free, forever.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="px-5 py-5 max-h-[80vh] overflow-y-auto">
          <ApiKeySettings onChange={(cfg) => onConfigChange?.(cfg)} />
        </div>

        {/* Bottom glow strip */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
      </div>
    </div>,
    document.body
  );
}
