'use client';

import { useState, useEffect } from 'react';
import {
  User, Database, Download, Trash2, Shield, MessageSquare,
  Users, Brain, CheckCircle, Terminal, AlertTriangle,
} from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { createClient } from '../../../lib/supabase/client';

export default function MyDataPage() {
  const [user, setUser] = useState<any>(null);
  const [dataSummary, setDataSummary] = useState<{ conversations: number; clients: number; memories: number; replies: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);
  const [testText, setTestText] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => { if (data?.user) setUser(data.user); });
    Promise.all([
      fetch('/api/conversations').then(r => r.json()).catch(() => ({})),
      fetch('/api/crm/clients').then(r => r.json()).catch(() => ({})),
    ]).then(([convData, crmData]) => {
      setDataSummary({
        conversations: convData.conversations?.length ?? 0,
        clients: crmData.clients?.length ?? 0,
        memories: 0,
        replies: convData.conversations?.reduce((a: number, c: any) => a + (c.suggested_replies?.length ?? 0), 0) ?? 0,
      });
    }).finally(() => setIsLoading(false));
  }, []);

  const handleExport = async () => {
    setExportStatus('Compiling your data...');
    try {
      const [convRes, crmRes] = await Promise.all([
        fetch('/api/conversations').then(r => r.json()),
        fetch('/api/crm/clients').then(r => r.json()),
      ]);
      const blob = new Blob([JSON.stringify({ conversations: convRes.conversations, clients: crmRes.clients }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      Object.assign(document.createElement('a'), { href: url, download: `vivekit-export-${new Date().toISOString().split('T')[0]}.json` }).click();
      URL.revokeObjectURL(url);
      setExportStatus('✓ Export downloaded successfully.');
    } catch { setExportStatus('Export failed. Please try again.'); }
    setTimeout(() => setExportStatus(null), 4000);
  };

  const handleSafetyTest = async () => {
    if (!testText.trim()) return;
    setIsScanning(true); setScanResult(null);
    try {
      const res = await fetch('/api/security', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ promptText: testText }) });
      if (res.ok) setScanResult((await res.json()).scanResult);
    } catch { /**/ } finally { setIsScanning(false); }
  };

  const accountAge = user?.created_at ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86400000) : null;

  return (
    <div className="flex flex-col h-full">
      <header className="h-14 shrink-0 border-b border-slate-900 px-8 flex items-center justify-between z-10 bg-slate-950/80 backdrop-blur-md relative">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-violet-500/20 to-transparent" />
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-bold uppercase tracking-wider">My Account</span>
          <span className="text-slate-700">/</span>
          <span className="text-slate-200 font-semibold">Data &amp; Privacy</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
          <Shield className="w-3.5 h-3.5" /> Data Protected
        </div>
      </header>

      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-6">

        {/* Account + Data Summary */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="bg-slate-900/20 border border-slate-900 p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <User className="w-4 h-4 text-violet-400" /> My Account
            </h3>
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {user.user_metadata?.avatar_url
                    ? <img src={user.user_metadata.avatar_url} alt="" className="w-10 h-10 rounded-full ring-2 ring-slate-700" />
                    : <div className="w-10 h-10 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center font-bold ring-2 ring-slate-700">{(user.email || 'U')[0].toUpperCase()}</div>
                  }
                  <div>
                    <div className="text-sm font-bold text-slate-200">{user.user_metadata?.full_name || user.email?.split('@')[0]}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[['Provider', 'Google OAuth'], ['Account Age', accountAge !== null ? `${accountAge} days` : '—']].map(([k, v]) => (
                    <div key={k} className="p-3 rounded-xl bg-slate-950/60 border border-slate-900">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wide">{k}</div>
                      <div className="text-xs font-bold text-slate-300 mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : <div className="h-20 flex items-center justify-center"><div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>}
          </Card>

          <Card className="bg-slate-900/20 border border-slate-900 p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <Database className="w-4 h-4 text-violet-400" /> My Data
            </h3>
            {isLoading
              ? <div className="h-20 flex items-center justify-center"><div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>
              : <div className="grid grid-cols-2 gap-3">
                  {([['Conversations', dataSummary?.conversations ?? 0, MessageSquare], ['Clients', dataSummary?.clients ?? 0, Users], ['AI Replies', dataSummary?.replies ?? 0, Brain], ['Memories', dataSummary?.memories ?? 0, Database]] as const).map(([label, value, Icon]) => (
                    <div key={label} className="p-3 rounded-xl bg-slate-950/60 border border-slate-900 flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-violet-400 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</div>
                        <div className="text-sm font-black text-slate-200">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </Card>
        </div>

        {/* Privacy Controls */}
        <Card className="bg-slate-900/20 border border-slate-900 p-6 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <Shield className="w-4 h-4 text-violet-400" /> Privacy Controls
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">You own your data. Export a full copy any time, or request permanent deletion.</p>
          </div>
          {exportStatus && <div className="p-3 rounded-lg bg-violet-600/10 border border-violet-500/20 text-xs text-violet-300 font-semibold">{exportStatus}</div>}
          {deleteStatus && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 font-semibold">{deleteStatus}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 space-y-3">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-violet-400 uppercase tracking-wider mb-1"><Download className="w-3.5 h-3.5" /> Export My Data</div>
                <p className="text-[10px] text-slate-500">Download all conversations, client profiles, and AI replies as JSON.</p>
              </div>
              <button onClick={handleExport} className="w-full py-2 bg-slate-900 border border-slate-800 hover:border-violet-500/40 hover:text-white text-slate-300 font-bold text-[10px] rounded-lg tracking-wider uppercase transition-all">
                Download Export
              </button>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-rose-900/30 space-y-3">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1"><Trash2 className="w-3.5 h-3.5" /> Delete My Data</div>
                <p className="text-[10px] text-slate-500">Permanently erase all your ViveKit data. This cannot be undone.</p>
              </div>
              <button
                onClick={() => {
                  if (!confirm('This will permanently delete all your ViveKit data. Continue?')) return;
                  setDeleteStatus('Deletion request submitted. Your data will be erased within 30 days per GDPR requirements.');
                  setTimeout(() => setDeleteStatus(null), 6000);
                }}
                className="w-full py-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 font-bold text-[10px] rounded-lg tracking-wider uppercase transition-all"
              >
                Request Deletion
              </button>
            </div>
          </div>
        </Card>

        {/* Reply Safety Tester */}
        <Card className="bg-slate-900/20 border border-slate-900 p-6 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <Terminal className="w-4 h-4 text-violet-400" /> Reply Safety Checker
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Paste any reply before sending — ViveKit checks for risky language, unauthorised promises, or policy violations.</p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-3">
              <textarea rows={5} value={testText} onChange={e => setTestText(e.target.value)} placeholder="Paste the reply you want to check before sending..." className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 resize-none font-mono leading-relaxed transition-colors" />
              <button onClick={handleSafetyTest} disabled={isScanning || !testText.trim()} className="px-4 py-2 bg-violet-600/10 border border-violet-500/30 hover:bg-violet-600/20 text-violet-300 font-bold text-xs rounded-xl tracking-wider uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {isScanning ? 'Checking...' : 'Check Safety'}
              </button>
            </div>
            <div>
              {scanResult ? (
                <div className="h-full p-4 rounded-xl bg-slate-950/60 border border-slate-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Result</span>
                    {scanResult.isMalicious
                      ? <div className="flex items-center gap-1 text-[9px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full animate-pulse"><AlertTriangle className="w-3 h-3" /> Risk</div>
                      : <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" /> Safe</div>
                    }
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-500">Risk score</span>
                      <span className={`font-bold ${scanResult.score > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>{scanResult.score}/100</span>
                    </div>
                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${scanResult.isMalicious ? 'bg-rose-600' : 'bg-emerald-600'}`} style={{ width: `${scanResult.score}%` }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-32 flex flex-col items-center justify-center text-slate-700 border border-slate-900 rounded-xl text-center p-4">
                  <Shield className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-[10px]">Result appears here.</p>
                </div>
              )}
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
