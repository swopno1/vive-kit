'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users,
  ShieldAlert, 
  TrendingUp, 
  Smile, 
  Target, 
  Search, 
  Plus, 
  DollarSign, 
  Activity, 
  Clock, 
  Brain,
  MessageSquare,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  Zap,
  Briefcase
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';

// =========================================================================
// ViveKit - AI CRM Client Relationship Intelligence Dashboard
// =========================================================================

export default function CRMIntelligenceDashboard() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [activeClientData, setActiveClientData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom Memory Inputs
  const [newMemoryCategory, setNewMemoryCategory] = useState<string>('preferences');
  const [newMemoryText, setNewMemoryText] = useState('');

  // Fetch all clients on mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch('/api/crm/clients');
        if (res.ok) {
          const data = await res.json();
          setClients(data.clients || []);
        }
      } catch (err) {
        console.error('Failed to fetch CRM clients:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClients();
  }, []);

  // Fetch active client detail whenever selectedClientId changes
  useEffect(() => {
    const fetchClientDetail = async () => {
      if (!selectedClientId) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/crm/clients/${selectedClientId}`);
        if (res.ok) {
          const data = await res.json();
          setActiveClientData(data);
        }
      } catch (err) {
        console.error('Failed to fetch client detail:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClientDetail();
  }, [selectedClientId]);

  // Local handler to add a memory block
  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryText || !activeClientData) return;

    const newMem = {
      customerId: selectedClientId,
      category: newMemoryCategory,
      content: newMemoryText,
      relevanceWeight: 0.9,
      createdAt: new Date().toISOString()
    };

    setActiveClientData({
      ...activeClientData,
      memories: [newMem, ...(activeClientData.memories ?? [])]
    });
    setNewMemoryText('');
  };

  // Filter client list based on search query
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row h-full">
      
      {/* 1. Left Sidebar - Accounts Grid list */}
      <aside className="w-full md:w-72 lg:w-80 border-b md:border-b-0 md:border-r border-slate-900 bg-slate-950 flex flex-col shrink-0 h-auto md:h-full max-h-60 md:max-h-none overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Sidebar Header */}
          <div className="p-6 space-y-4 shrink-0">
            <div className="flex items-center gap-3">
              <div>
                
                <h2 className="text-sm font-black text-slate-200">CRM Intelligence Brain</h2>
              </div>
            </div>
            
            <div className="h-px bg-slate-900" />

            {/* Quick Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search CRM accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-900 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          {/* Accounts Grid list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1">
            <Label className="px-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Accounts Index</Label>
            {filteredClients.length > 0 ? (
              filteredClients.map((c) => {
                const isSelected = selectedClientId === c.id;
                const isHighRisk = c.scores?.churnRiskScore > 40;
                
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClientId(c.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1.5 ${
                      isSelected 
                        ? 'bg-slate-900 border-slate-800 shadow-lg' 
                        : 'bg-slate-950/40 border-transparent hover:bg-slate-900/10'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <h3 className={`text-xs font-bold transition-colors ${isSelected ? 'text-slate-100' : 'text-slate-400'}`}>
                        {c.name}
                      </h3>
                      {isHighRisk && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0 mt-1" />
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 font-semibold truncate max-w-[130px]">{c.email}</span>
                      <span className="font-bold text-slate-300">${(c.revenue || 0).toLocaleString()}</span>
                    </div>

                    <div className="flex gap-1.5 items-center mt-1">
                      <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        c.segment === 'premium' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        c.segment === 'high_maintenance' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {c.segment.replace('_', ' ')}
                      </span>
                      <span className="text-[9px] font-medium text-slate-500">Trust: {c.scores?.trustScore}%</span>
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-[10px] text-slate-500 text-center py-6">No CRM accounts found.</p>
            )}
          </div>
        </div>

        {/* Action button at bottom */}
        <div className="p-6 border-t border-slate-900 space-y-3">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
            <span className="text-[9px] font-bold text-slate-500 tracking-wider">CRM LIVE MODULE</span>
          </div>
          <Link 
            href="/admin/business"
            className="w-full py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-violet-400" />
            <span>AI Rule Calibration</span>
          </Link>
        </div>
      </aside>

      {/* 2. Main Analytics Desk */}
      <main className="flex-1 bg-slate-950 flex flex-col h-full overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-violet-500/20 to-transparent" />

        {/* Top Header */}
        <header className="h-14 shrink-0 border-b border-slate-900 px-4 sm:px-8 flex items-center justify-between z-10 bg-slate-950/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-xs font-bold capitalize">CRM Center</span>
            <span className="text-slate-700 text-xs hidden sm:block">/</span>
            <span className="text-slate-200 text-xs font-semibold">Client Intelligence profile</span>
          </div>
        </header>

        {/* Dashboard Workspace */}
        {isLoading && !activeClientData ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs">Extracting Relationship Context...</p>
          </div>
        ) : activeClientData ? (
          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar space-y-6 z-10">
            
            {/* ROW 1: EXEC HEADER & HEALTH DIALS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              
              {/* Profile Card Summary */}
              <Card className="bg-slate-900/30 border border-slate-900 p-5 flex flex-col justify-between col-span-1">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-sm">
                      {activeClientData.crmProfile?.strategicImportance === 'vip' ? 'VIP' : 'CL'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Lifecycle Status</h4>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[11px] font-bold text-emerald-400 capitalize">{activeClientData.crmProfile?.lifecycleStage}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-px bg-slate-900/60" />
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Segmentation</span>
                      <span className="font-bold text-slate-300 capitalize">{activeClientData.crmProfile?.clientSegmentation?.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">LTV Estimate</span>
                      <span className="font-bold text-emerald-400">${activeClientData.crmProfile?.lifetimeValueEst?.toLocaleString() ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Strategic Weight</span>
                      <span className="font-bold text-indigo-400 capitalize">{activeClientData.crmProfile?.strategicImportance}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Trust & Engagement health */}
              <Card className="bg-slate-900/30 border border-slate-900 p-5 space-y-4 col-span-1">
                <div className="flex justify-between items-center text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <span>Relationship Trajectory</span>
                  <Smile className="w-4 h-4 text-emerald-400" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-500">TRUST SCORE</span>
                    <h5 className="text-2xl font-black text-slate-100">{activeClientData.scores?.trustScore}%</h5>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-500">SATISFACTION</span>
                    <h5 className="text-2xl font-black text-slate-100">{activeClientData.scores?.satisfactionIndicator}%</h5>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
                    <span>Trend Trajectory</span>
                    <span className="text-emerald-400">{activeClientData.scores?.trajectoryTrend}</span>
                  </div>
                  <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full w-4/5" />
                  </div>
                </div>
              </Card>

              {/* Churn risk and alert */}
              <Card className="bg-slate-900/30 border border-slate-900 p-5 space-y-4 col-span-1">
                <div className="flex justify-between items-center text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <span>Retention Alert Index</span>
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-500">CHURN RISK</span>
                    <h5 className={`text-2xl font-black ${
                      activeClientData.scores?.churnRiskScore > 40 ? 'text-rose-500 animate-pulse' : 'text-slate-100'
                    }`}>
                      {activeClientData.scores?.churnRiskScore}%
                    </h5>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-500">PAYMENT SPEED</span>
                    <h5 className="text-2xl font-black text-slate-100">{activeClientData.crmProfile?.paymentReliability}%</h5>
                  </div>
                </div>

                <div className="p-2 rounded bg-slate-950/60 border border-slate-900 flex justify-between items-center text-[10px]">
                  <span className="font-semibold text-slate-500">Account status</span>
                  <span className="font-bold text-emerald-400 capitalize">{activeClientData.crmProfile?.accountStatus}</span>
                </div>
              </Card>

            </div>

            {/* ROW 2: STRATEGIC RECS (THE COACH) */}
            <Card className="bg-indigo-950/10 border border-indigo-900/40 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full filter blur-xl" />
              
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>AI Relationship Strategy Coach</span>
                  </h4>
                  <p className="text-[10px] text-slate-500">Dynamic tactics generated in real-time by ViveKit Strategy Engine.</p>
                </div>
                
                <span className="text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase tracking-wide">
                  Calibrated tone advisor
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-xs">
                
                <div className="space-y-3 col-span-1">
                  <div className="space-y-1 p-3 rounded-lg bg-slate-900/30 border border-slate-900">
                    <span className="font-bold text-slate-400 block uppercase text-[9px] tracking-wider">Negotiation Approach</span>
                    <p className="text-slate-300 leading-normal">{activeClientData.strategy?.negotiationApproach}</p>
                  </div>
                  <div className="space-y-1 p-3 rounded-lg bg-slate-900/30 border border-slate-900">
                    <span className="font-bold text-slate-400 block uppercase text-[9px] tracking-wider">Communication & Tone Advice</span>
                    <p className="text-slate-300 leading-normal">{activeClientData.strategy?.communicationToneAdvice}</p>
                  </div>
                </div>

                <div className="space-y-3 col-span-1">
                  <div className="space-y-1 p-3 rounded-lg bg-slate-900/30 border border-slate-900">
                    <span className="font-bold text-slate-400 block uppercase text-[9px] tracking-wider">Retention & Mitigation Tactics</span>
                    <p className="text-slate-300 leading-normal">{activeClientData.strategy?.retentionTactics}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 p-3 rounded-lg bg-slate-900/30 border border-slate-900 text-center">
                      <span className="font-bold text-slate-500 block uppercase text-[9px] tracking-wider">Upsell Opportunity</span>
                      <span className="font-black text-[11px] text-indigo-400 tracking-tight">{activeClientData.strategy?.upsellTiming}</span>
                    </div>
                    <div className="space-y-1 p-3 rounded-lg bg-slate-900/30 border border-slate-900 text-center">
                      <span className="font-bold text-slate-500 block uppercase text-[9px] tracking-wider">Escalation Response</span>
                      <span className="font-black text-[11px] text-rose-400 tracking-tight">{activeClientData.strategy?.escalationRules}</span>
                    </div>
                  </div>
                </div>

              </div>
            </Card>

            {/* ROW 3: BEHAVIORAL PROFILE & LEAD SCORES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Behavioral Profiles table */}
              <Card className="bg-slate-900/30 border border-slate-900 p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-violet-400" />
                  <span>Evolving Behavioral profiling</span>
                </h4>
                
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs leading-normal">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 font-bold uppercase block">Negotiation Stance</span>
                    <span className="font-semibold text-slate-200 capitalize">{activeClientData.behavior?.negotiationStyle}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 font-bold uppercase block">Pricing Sensitivity</span>
                    <span className="font-semibold text-slate-200 capitalize">{activeClientData.behavior?.pricingSensitivity}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 font-bold uppercase block">Urgency Request level</span>
                    <span className="font-semibold text-slate-200 capitalize">{activeClientData.behavior?.urgencyBehavior}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 font-bold uppercase block">Decision-Making Pattern</span>
                    <span className="font-semibold text-slate-200 capitalize">{activeClientData.behavior?.decisionMakingPattern}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 font-bold uppercase block">Emotional Calibration</span>
                    <span className="font-semibold text-slate-200 capitalize">{activeClientData.behavior?.emotionalVolatility}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 font-bold uppercase block">Commitment consistency</span>
                    <span className="font-bold text-emerald-400">{activeClientData.behavior?.commitmentConsistency}%</span>
                  </div>
                </div>
              </Card>

              {/* Lead qualifications & signals */}
              <Card className="bg-slate-900/30 border border-slate-900 p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span>Lead Qualification</span>
                  </h4>
                  <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border uppercase ${
                    activeClientData.qualification?.qualificationStatus === 'qualified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {activeClientData.qualification?.qualificationStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5 p-3 rounded-lg bg-slate-950 border border-slate-900 text-center">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Budget Confirmed</span>
                    <span className="font-bold text-slate-200 block text-xs">
                      {activeClientData.qualification?.budgetQualified ? '✓ Yes (Value Pitch)' : '✗ Not Yet'}
                    </span>
                  </div>
                  <div className="space-y-1.5 p-3 rounded-lg bg-slate-950 border border-slate-900 text-center">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Buying Intent Score</span>
                    <span className="font-bold text-indigo-400 block text-xs">
                      {activeClientData.qualification?.intentScore} / 100
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 leading-relaxed">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block">Buying Signals Checklist</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeClientData.qualification?.buyingSignals?.map((sig: string, idx: number) => (
                      <span key={idx} className="bg-slate-900 text-slate-350 px-2 py-0.5 rounded text-[10px] border border-slate-800 font-medium">
                        ✓ {sig.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>

            </div>

            {/* ROW 4: MEMORY BANK & TIMELINE FEED */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Evolving Memory List & Input */}
              <Card className="bg-slate-900/30 border border-slate-900 p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-indigo-400" />
                    <span>Client Memory Intelligence</span>
                  </h4>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar">
                  {(activeClientData.memories ?? []).map((m: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-900/60 text-xs leading-normal space-y-1">
                      <div className="flex justify-between items-center">
                        <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border capitalize ${
                          m.category === 'frustrations' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          m.category === 'preferences' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                          'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {m.category}
                        </span>
                        <span className="text-[9px] text-slate-500 font-medium">Relevance: {m.relevanceWeight * 100}%</span>
                      </div>
                      <p className="text-slate-300">{m.content}</p>
                    </div>
                  ))}
                </div>

                {/* Add memory form */}
                <form onSubmit={handleAddMemory} className="flex gap-2">
                  <select 
                    value={newMemoryCategory}
                    onChange={(e) => setNewMemoryCategory(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="preferences">Preference</option>
                    <option value="frustrations">Frustration</option>
                    <option value="goals">Goal</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Log client behavior memory snippet..."
                    value={newMemoryText}
                    onChange={(e) => setNewMemoryText(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <button 
                    type="submit"
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>
              </Card>

              {/* Vertical Chronological timeline */}
              <Card className="bg-slate-900/30 border border-slate-900 p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Chronological Relationship Timeline</span>
                </h4>

                <div className="space-y-4 relative pl-4 max-h-75 overflow-y-auto custom-scrollbar border-l border-slate-900 ml-2">
                  {(activeClientData.timeline ?? []).map((t: any, idx: number) => (
                    <div key={idx} className="relative space-y-1">
                      
                      {/* Timeline dot */}
                      <span className="absolute -left-5.25 top-1 w-2.5 h-2.5 rounded-full border bg-slate-950 border-emerald-500 flex items-center justify-center shrink-0" />
                      
                      <div className="flex justify-between items-start text-xs">
                        <h5 className="font-bold text-slate-200 leading-none">{t.title}</h5>
                        <span className="text-[9px] text-slate-500 whitespace-nowrap font-medium">
                          {new Date(t.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-slate-400 leading-normal">{t.description}</p>
                      
                      <div className="flex gap-1.5 pt-0.5">
                        {t.semanticTags.map((tag: string, tagIdx: number) => (
                          <span key={tagIdx} className="text-[8px] font-mono text-slate-500 capitalize">
                            #{tag.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

            </div>

          </div>
        ) : null}
      </main>

    </div>
  );
}
