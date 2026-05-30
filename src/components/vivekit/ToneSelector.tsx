import React from 'react';
import { TonePreference } from '../../types';
import { Shield, Sparkles, Heart, Zap } from 'lucide-react';

interface ToneSelectorProps {
  value: TonePreference;
  onChange: (tone: TonePreference) => void;
  disabled?: boolean;
}

export function ToneSelector({ value, onChange, disabled }: ToneSelectorProps) {
  const tones = [
    { id: 'professional', label: 'Professional', icon: Shield, style: '👔', desc: 'Formal, precise' },
    { id: 'casual', label: 'Casual', icon: Sparkles, style: '👋', desc: 'Warm, conversational' },
    { id: 'empathetic', label: 'Empathetic', icon: Heart, style: '❤️', desc: 'Understanding' },
    { id: 'urgent', label: 'Direct', icon: Zap, style: '⚡', desc: 'Action-oriented' }
  ] as const;

  return (
    <div className="flex flex-col gap-2 select-none">
      <div className="flex justify-between items-center shrink-0">
        <label className="text-slate-300 text-xs font-semibold tracking-wide">Brand Voice Tone</label>
        <span className="text-[10px] text-slate-500 italic">Overrides default settings</span>
      </div>
      
      {/* Grid segments */}
      <div className="grid grid-cols-4 gap-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
        {tones.map((t) => {
          const Icon = t.icon;
          const isActive = value === t.id;
          return (
            <button
              key={t.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(t.id)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all duration-300 relative group cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                isActive
                  ? 'bg-slate-900 border-slate-700 text-white shadow-inner'
                  : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/40'
              }`}
            >
              {isActive && (
                <div className="absolute inset-x-3 bottom-0 h-[2px] bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" />
              )}
              
              <span className={`text-base transition-transform duration-300 group-hover:scale-110 ${isActive ? 'scale-105' : 'opacity-70'}`}>
                {t.style}
              </span>
              <span className="text-[10px] font-bold mt-1 tracking-wide">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
