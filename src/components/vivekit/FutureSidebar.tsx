'use client';

import React, { useState, useEffect } from 'react';
import { Label } from '../ui/label';
import {
  Users,
  History,
  GitCommit,
  Sliders,
  ChevronDown,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface Conversation {
  id: string;
  raw_history: string;
  channel: string;
  created_at: string;
  suggested_replies?: { status: string }[];
}

export function FutureSidebar() {
  const [activeSubTab, setActiveSubTab] = useState<'history' | 'crm' | 'timeline' | 'settings'>('history');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/conversations')
      .then(r => r.json())
      .then(d => setConversations(d.conversations ?? []))
      .catch(() => {});

    fetch('/api/crm/clients')
      .then(r => r.json())
      .then(d => setClients(d.clients ?? []))
      .catch(() => {});
  }, []);

  return (
    <aside className="w-80 border-l border-slate-900 bg-slate-950/80 backdrop-blur-xl flex flex-col justify-between text-slate-300 select-none shrink-0 p-6 h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col gap-6">

        {/* Workspace identifier */}
        <div className="space-y-2">
          <Label className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Active Workspace</Label>
          <div className="relative group cursor-pointer">
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/30 hover:border-slate-700/80 hover:bg-slate-900/50 transition-all duration-300">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="ViveKit Logo" className="w-5 h-5 rounded-md border border-slate-800 object-cover" />
                <span className="text-xs font-bold text-slate-200">ViveScript Agency</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
            </div>
            <span className="absolute -top-1.5 -right-1 text-[8px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-widest scale-90">
              Multi-OS
            </span>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-900 text-xs shrink-0">
          {(['history', 'crm', 'timeline', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`flex-1 py-1.5 rounded-md text-center font-bold transition-all ${
                activeSubTab === tab ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab === 'timeline' ? 'RAG' : tab === 'settings' ? 'OS' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-87.5">

          {/* History tab */}
          {activeSubTab === 'history' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <span>Recent Conversations</span>
                <History className="w-3.5 h-3.5" />
              </div>
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-slate-600 text-xs">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p>No conversations yet.</p>
                  <p className="text-[10px] mt-1">Generate and approve a reply to see history.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {conversations.slice(0, 6).map((c) => {
                    const preview = c.raw_history?.slice(0, 60) || 'Conversation';
                    const status = c.suggested_replies?.[0]?.status || 'pending';
                    return (
                      <div key={c.id} className="p-3 rounded-xl border border-slate-900 bg-slate-950/40 relative group hover:border-slate-800 transition-colors">
                        <span className="absolute right-3 top-3 text-[8px] font-semibold text-slate-500">
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                        <h5 className="text-[11px] font-bold text-slate-300 pr-12 truncate">{preview}…</h5>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">{status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* CRM profiles tab */}
          {activeSubTab === 'crm' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <span>Active Client Profiles</span>
                <Users className="w-3.5 h-3.5" />
              </div>
              {clients.length === 0 ? (
                <div className="text-center py-8 text-slate-600 text-xs">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p>No clients yet.</p>
                  <p className="text-[10px] mt-1">Add clients in the CRM dashboard.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {clients.slice(0, 5).map((c, idx) => (
                    <div key={c.id || idx} className="p-3 rounded-xl border border-slate-900 bg-slate-950/40 space-y-1.5 hover:border-slate-800 transition-colors">
                      <div className="flex justify-between items-center">
                        <h5 className="text-[11px] font-bold text-slate-200">{c.name}</h5>
                        <span className="text-[8px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 rounded border border-indigo-500/20">{c.segment || c.type}</span>
                      </div>
                      <p className="text-[9px] text-slate-500 truncate">{c.company || ''} • {c.email}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* RAG memory tab */}
          {activeSubTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <span>RAG Retrieval Vector Stream</span>
                <GitCommit className="w-3.5 h-3.5" />
              </div>
              <div className="text-center py-8 text-slate-600 text-xs">
                <GitCommit className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p>RAG memories surface here</p>
                <p className="text-[10px] mt-1">after conversation analysis runs.</p>
              </div>
            </div>
          )}

          {/* Engine settings tab */}
          {activeSubTab === 'settings' && (
            <div className="space-y-5">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <span>Engine Settings</span>
                <Sliders className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-400">LLM Provider</span>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    <span>Gemini 2.0 Flash</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-semibold text-slate-400">Temperature</span>
                    <span className="font-bold text-slate-300">0.2</span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-600 rounded-full w-1/5" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-semibold text-slate-400">Top-K Memory Limit</span>
                    <span className="font-bold text-slate-300">3 Matches</span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full w-3/5" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer scoreboard */}
      <div className="p-3.5 rounded-xl bg-slate-900/30 border border-slate-900 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Conversations</span>
        </div>
        <span className="text-xs font-bold text-slate-100">{conversations.length}</span>
      </div>
    </aside>
  );
}
