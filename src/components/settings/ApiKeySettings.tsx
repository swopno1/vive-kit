'use client';

import React, { useEffect, useState } from 'react';
import { ExternalLink, Eye, EyeOff, Check, Trash2, KeyRound, ChevronDown } from 'lucide-react';
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

interface ProviderInfo {
  id: SupportedProvider;
  name: string;
  description: string;
  docsUrl: string;
  docsLabel: string;
  color: string;
  models: { id: string; label: string }[];
  active: true;
}

interface InactiveProvider {
  id: string;
  name: string;
  description: string;
  active: false;
}

type AnyProvider = ProviderInfo | InactiveProvider;

const PROVIDERS: AnyProvider[] = [
  {
    id: 'google',
    name: 'Google Gemini',
    description: 'Fast & capable — free tier available via AI Studio.',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    docsLabel: 'Get key on AI Studio →',
    color: 'from-blue-500 to-cyan-500',
    models: [
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (fast)' },
      { id: 'gemini-2.0-pro', label: 'Gemini 2.0 Pro (powerful)' },
    ],
    active: true,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o — requires prepaid credits.',
    docsUrl: 'https://platform.openai.com/api-keys',
    docsLabel: 'Get key on OpenAI Platform →',
    color: 'from-emerald-500 to-teal-500',
    models: [{ id: 'gpt-4o', label: 'GPT-4o' }],
    active: true,
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude 3.5 Sonnet — requires a paid account.',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    docsLabel: 'Get key on Anthropic Console →',
    color: 'from-orange-500 to-amber-500',
    models: [{ id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' }],
    active: true,
  },
  // Coming-soon providers — rendered as inactive tiles
  { id: 'mistral', name: 'Mistral', description: 'Coming soon', active: false },
  { id: 'cohere', name: 'Cohere', description: 'Coming soon', active: false },
  { id: 'xai', name: 'xAI Grok', description: 'Coming soon', active: false },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface ApiKeySettingsProps {
  /** Called after the user saves or clears their config so callers can refresh the badge. */
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

  // Load existing config on mount
  useEffect(() => {
    const cfg = getUserAIConfig();
    setExisting(cfg);
    if (cfg) {
      setSelectedId(cfg.provider);
      setSelectedModel(cfg.model);
      // Do NOT pre-fill the key input — show placeholder instead
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
    <div className="space-y-6">
      {/* Active config badge */}
      {existing && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <Check className="w-4 h-4 shrink-0" />
          <span className="flex-1 truncate">
            Using your <span className="font-semibold">{PROVIDERS.find(p => p.id === existing.provider)?.name}</span> key
            {' · '}<span className="font-mono text-xs opacity-70">{existing.model}</span>
          </span>
          <button
            onClick={handleClear}
            title="Remove key"
            className="p-1 rounded-md hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Provider grid */}
      <div>
        <Label className="text-xs text-slate-400 uppercase tracking-widest mb-3 block">
          Select AI Provider
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PROVIDERS.map((p) => {
            if (!p.active) {
              return (
                <div
                  key={p.id}
                  className="relative flex flex-col gap-1 p-3.5 rounded-xl border border-slate-800 opacity-40 cursor-not-allowed select-none"
                >
                  <span className="text-xs font-semibold text-slate-400">{p.name}</span>
                  <span className="text-[10px] text-slate-600">{p.description}</span>
                  <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-widest text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded-full">
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
                className={`flex flex-col gap-1 p-3.5 rounded-xl border text-left transition-all duration-150 ${
                  isSelected
                    ? 'border-violet-500/60 bg-violet-500/10 ring-1 ring-violet-500/30'
                    : 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <span className={`text-xs font-semibold bg-linear-to-r ${p.color} bg-clip-text text-transparent`}>
                  {p.name}
                </span>
                <span className="text-[10px] text-slate-500 leading-snug">{p.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Provider-specific form */}
      {activeProvider && (
        <div className="space-y-4 pt-2 border-t border-slate-800/60">
          {/* Docs link */}
          <a
            href={activeProvider.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            {activeProvider.docsLabel}
          </a>

          {/* Model selector */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-400">Model</Label>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full appearance-none bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 pr-8 cursor-pointer"
              >
                {activeProvider.models.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
          </div>

          {/* API key input */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-400">
              {activeProvider.name} API Key
            </Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <Input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setError(''); }}
                placeholder={existing?.provider === selectedId ? '••••••••  (key saved — enter new to replace)' : 'Paste your API key here'}
                className="pl-9 pr-10 bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600 focus:border-violet-500 focus:ring-violet-500/40 font-mono text-xs"
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
              Your key is stored only in your browser's localStorage and is never sent to ViveScript servers. It goes directly to {activeProvider.name} on each AI request.
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
            className={`w-full text-sm transition-all ${
              saved
                ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                : 'bg-violet-600 hover:bg-violet-500 text-white'
            }`}
          >
            {saved ? (
              <span className="flex items-center gap-2"><Check className="w-3.5 h-3.5" /> Key saved</span>
            ) : (
              'Save API Key'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
