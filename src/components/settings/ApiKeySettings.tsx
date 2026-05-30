'use client';

import React, { useEffect, useState } from 'react';
import { ExternalLink, Eye, EyeOff, Check, Trash2, KeyRound, ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  getUserAIConfig,
  setUserAIConfig,
  clearUserAIConfig,
  SupportedProvider,
  UserAIConfig,
} from '../../lib/user-ai-config';

// ─── Provider catalog ────────────────────────────────────────────────────────

interface ModelOption {
  id: string;
  label: string;
  badge?: string; // e.g. 'Latest' | 'Fast' | 'Stable'
}

interface ProviderInfo {
  id: SupportedProvider;
  name: string;
  description: string;
  docsUrl: string;
  docsLabel: string;
  gradient: string;        // tailwind gradient classes for the card accent
  models: ModelOption[];
  active: true;
}

interface InactiveProvider {
  id: string;
  name: string;
  active: false;
}

type AnyProvider = ProviderInfo | InactiveProvider;

const PROVIDERS: AnyProvider[] = [
  {
    id: 'google',
    name: 'Google Gemini',
    description: 'Free tier via AI Studio. Fastest throughput.',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    docsLabel: 'Get key on Google AI Studio →',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    models: [
      { id: 'gemini-2.5-flash',   label: 'Gemini 2.5 Flash',  badge: 'Latest' },
      { id: 'gemini-2.5-pro',     label: 'Gemini 2.5 Pro',    badge: 'Powerful' },
      { id: 'gemini-2.0-flash',   label: 'Gemini 2.0 Flash',  badge: 'Stable' },
    ],
    active: true,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Requires prepaid credits. Best coding quality.',
    docsUrl: 'https://platform.openai.com/api-keys',
    docsLabel: 'Get key on OpenAI Platform →',
    gradient: 'from-emerald-500 via-green-500 to-lime-500',
    models: [
      { id: 'gpt-4.1',       label: 'GPT-4.1',      badge: 'Latest' },
      { id: 'gpt-4.1-mini',  label: 'GPT-4.1 Mini', badge: 'Fast' },
      { id: 'gpt-4o',        label: 'GPT-4o',        badge: 'Stable' },
    ],
    active: true,
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Requires paid account. Best for complex reasoning.',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    docsLabel: 'Get key on Anthropic Console →',
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    models: [
      { id: 'claude-3-7-sonnet-20250219', label: 'Claude 3.7 Sonnet',  badge: 'Latest' },
      { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet',  badge: 'Stable' },
      { id: 'claude-3-5-haiku-20241022',  label: 'Claude 3.5 Haiku',   badge: 'Fast' },
    ],
    active: true,
  },
  { id: 'mistral', name: 'Mistral',  active: false },
  { id: 'cohere',  name: 'Cohere',   active: false },
  { id: 'xai',     name: 'xAI Grok', active: false },
];

const BADGE_STYLES: Record<string, string> = {
  Latest:    'bg-violet-500/20 text-violet-300',
  Powerful:  'bg-blue-500/20 text-blue-300',
  Fast:      'bg-emerald-500/20 text-emerald-300',
  Stable:    'bg-slate-600/40 text-slate-400',
};

// ─── Component ───────────────────────────────────────────────────────────────

interface ApiKeySettingsProps {
  onChange?: (config: UserAIConfig | null) => void;
}

export function ApiKeySettings({ onChange }: ApiKeySettingsProps) {
  const [selectedId, setSelectedId] = useState<SupportedProvider | null>(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [existing, setExisting] = useState<UserAIConfig | null>(null);

  useEffect(() => {
    const cfg = getUserAIConfig();
    setExisting(cfg);
    if (cfg) {
      setSelectedId(cfg.provider);
      setSelectedModel(cfg.model);
    }
  }, []);

  const activeProvider = selectedId
    ? (PROVIDERS.find((p) => p.id === selectedId && p.active) as ProviderInfo | undefined)
    : undefined;

  const handleProviderSelect = (p: ProviderInfo) => {
    setSelectedId(p.id);
    setSelectedModel(p.models[0].id);
    setApiKey('');
    setError('');
    setSaved(false);
  };

  const handleSave = () => {
    setError('');
    if (!selectedId || !activeProvider) { setError('Please select a provider.'); return; }
    if (!selectedModel) { setError('Please select a model.'); return; }
    if (!apiKey.trim()) { setError('Please enter your API key.'); return; }

    const cfg: UserAIConfig = { provider: selectedId, model: selectedModel, apiKey: apiKey.trim() };
    setUserAIConfig(cfg);
    setExisting(cfg);
    setApiKey('');
    setSaved(true);
    onChange?.(cfg);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClear = () => {
    clearUserAIConfig();
    setExisting(null);
    setSelectedId(null);
    setSelectedModel('');
    setApiKey('');
    setError('');
    setSaved(false);
    onChange?.(null);
  };

  return (
    <div className="space-y-5">

      {/* Active config banner */}
      {existing && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <Check className="w-4 h-4 shrink-0" />
          <span className="flex-1 truncate text-xs">
            Using your <span className="font-semibold">
              {PROVIDERS.find(p => p.id === existing.provider)?.name}
            </span> key
            <span className="mx-1 text-emerald-600">·</span>
            <span className="font-mono opacity-70">{existing.model}</span>
          </span>
          <button
            onClick={handleClear}
            title="Remove key"
            className="p-1 rounded-md hover:bg-rose-500/20 hover:text-rose-400 transition-colors shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Provider cards */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
          Select AI Provider
        </p>
        <div className="grid grid-cols-3 gap-2">
          {PROVIDERS.map((p) => {
            if (!p.active) {
              return (
                <div
                  key={p.id}
                  className="relative flex flex-col gap-0.5 p-3 rounded-xl border border-slate-800/60 opacity-35 cursor-not-allowed select-none"
                >
                  <span className="text-[11px] font-semibold text-slate-400">{p.name}</span>
                  <span className="absolute top-1.5 right-1.5 text-[8px] font-bold uppercase tracking-wider text-slate-600 bg-slate-800 px-1 py-0.5 rounded-full">
                    Soon
                  </span>
                </div>
              );
            }

            const isSelected = selectedId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleProviderSelect(p)}
                className={`relative flex flex-col gap-1 p-3 rounded-xl border text-left transition-all duration-150 overflow-hidden ${
                  isSelected
                    ? 'border-violet-500/50 bg-violet-500/8 ring-1 ring-violet-500/25 shadow-lg shadow-violet-500/10'
                    : 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/30'
                }`}
              >
                {/* Gradient accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${p.gradient} ${isSelected ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
                <span className={`text-[11px] font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {p.name}
                </span>
                <span className="text-[9px] text-slate-500 leading-tight">{p.description}</span>
                {isSelected && (
                  <span className="absolute top-1.5 right-1.5">
                    <Check className="w-3 h-3 text-violet-400" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Provider-specific config */}
      {activeProvider && (
        <div className="space-y-4 pt-4 border-t border-slate-800/60">

          {/* Docs link */}
          <a
            href={activeProvider.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] text-violet-400 hover:text-violet-300 transition-colors font-medium"
          >
            <ExternalLink className="w-3 h-3" />
            {activeProvider.docsLabel}
          </a>

          {/* Model selector */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Model</Label>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full appearance-none bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 pr-9 cursor-pointer transition-colors"
              >
                {activeProvider.models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}{m.badge ? ` — ${m.badge}` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>

            {/* Model badge pills */}
            <div className="flex gap-1.5 flex-wrap pt-0.5">
              {activeProvider.models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all border ${
                    selectedModel === m.id
                      ? 'border-violet-500/50 bg-violet-500/15 text-violet-300'
                      : 'border-slate-700 bg-slate-800/50 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {m.badge === 'Latest' && <Sparkles className="w-2.5 h-2.5" />}
                  {m.label}
                  {m.badge && (
                    <span className={`ml-0.5 px-1 rounded-full text-[8px] font-bold ${BADGE_STYLES[m.badge] ?? ''}`}>
                      {m.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* API key */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {activeProvider.name} API Key
            </Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <Input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setError(''); }}
                placeholder={
                  existing?.provider === selectedId
                    ? '••••••••  (saved — enter new to replace)'
                    : 'Paste your API key here'
                }
                className="pl-9 pr-10 bg-slate-900 border-slate-700/80 text-slate-100 placeholder:text-slate-600 focus:border-violet-500 focus:ring-violet-500/30 font-mono text-xs rounded-xl"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                aria-label={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              Stored only in your browser's localStorage. Never sent to ViveScript servers — goes directly to {activeProvider.name}.
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-rose-400 flex items-center gap-1.5">
              <span className="inline-block w-1 h-1 rounded-full bg-rose-400 shrink-0" />
              {error}
            </p>
          )}

          {/* Save */}
          <Button
            onClick={handleSave}
            disabled={saved}
            className={`w-full text-sm rounded-xl transition-all font-semibold ${
              saved
                ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20'
            }`}
          >
            {saved
              ? <span className="flex items-center gap-2"><Check className="w-3.5 h-3.5" /> Key saved</span>
              : 'Save API Key'
            }
          </Button>
        </div>
      )}
    </div>
  );
}
