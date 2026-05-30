'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Settings, 
  Shield, 
  Sliders, 
  Activity, 
  Users, 
  DollarSign, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle,
  Save, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Flame,
  ArrowRight,
  Eye,
  Check
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';

// =========================================================================
// ViveKit - Central Business Intelligence Console
// =========================================================================

type AdminTab = 'profile' | 'services' | 'rules' | 'voice' | 'governance' | 'analytics';

export default function BusinessSettingsDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Business Profile states
  const [profile, setProfile] = useState({
    businessName: 'ViveScript Solutions',
    industry: 'AI consulting & enterprise SaaS development',
    websiteUrl: 'https://www.vivescriptsolutions.com',
    pricingPhilosophy: 'Value-based premium positioning. Flat-rate productized subscriptions.',
    generalContext: 'Premium technical agency building custom AI integrations, LLM fine-tuning pipelines, and semantic RAG search architectures.',
    deliveryProcess: 'Phase 1: Sprints & Architecture (14d). Phase 2: Core deployment (30d). Wave-based releases with high test coverage.',
    boundaries: 'No client refunds after architectural sign-off. Instant Slack-huddles reserved for VIP Tiers.',
    pricingInstructions: 'Standard Retainer: $7,900/mo. Enterprise Base: $14,500/mo. Authorized discounts strictly limited to 15% max.'
  });

  // Service Profiles states
  const [services, setServices] = useState([
    { id: '1', name: 'AI Strategy Blueprint', pricingType: 'fixed', priceMin: 2500, durationDays: 14, scope: 'Architectural blueprint, tech stack alignment, operational ROI analysis.' },
    { id: '2', name: 'Productized AI Retainer', pricingType: 'recurring', priceMin: 7900, durationDays: 30, scope: 'Iterative sprint deliverables, prompt optimizations, custom API adapters.' },
    { id: '3', name: 'Enterprise AI OS Deployment', pricingType: 'recurring', priceMin: 14500, durationDays: 60, scope: 'Enterprise LLM deployments, pgvector query tuning, dedicated workspace dashboards.' }
  ]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceScope, setNewServiceScope] = useState('');

  // Brand Voice Calibration states
  const [selectedVoice, setSelectedVoice] = useState('premium');
  const [formalitySlider, setFormalitySlider] = useState(85); // 0-100
  const [emotionSlider, setEmotionSlider] = useState(25); // 0-100 (highly reserved)
  const [techDepthSlider, setTechDepthSlider] = useState(80); // 0-100
  const [persuasionSlider, setPersuasionSlider] = useState(75); // consultative

  // Rule Engine Playback States
  const [activeRules, setActiveRules] = useState([
    { id: 't1', category: 'timeline', trigger: 'deliver_under_5_days', action: 'block', desc: 'Prevent commitments under 5 business days without architect approval.', active: true },
    { id: 'g1', category: 'guarantees', trigger: 'forbidden_guarantees', action: 'block', desc: 'Prevent absolute guarantees of "100% bug-free" software.', active: true },
    { id: 'r1', category: 'refund', trigger: 'money_back_guarantee', action: 'block', desc: 'Block money-back refund commitments inside chats.', active: true },
    { id: 'p1', category: 'pricing', trigger: 'unauthorized_discounts', action: 'warn', desc: 'Warn if agent offers discounts larger than 15%.', active: true }
  ]);

  // Real-time Governance Validator Playground states
  const [playgroundText, setPlaygroundText] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  const [analytics, setAnalytics] = useState<any>({
    negotiationOutcomes: { standardPricingAccepted: 0, authorizedDiscountApplied: 0, negotiationFailed: 0, averageContractValue: 0 },
    objectionFrequency: { pricingTooExpensive: 0, scopeCreepRequest: 0, timelineTooLong: 0, refundAttempt: 0 },
    aiSuggestionSuccess: { approvedUntouched: 0, modifiedByAgent: 0, rejectedByAgent: 0 }
  });

  const [recentAudits, setRecentAudits] = useState<any[]>([]);

  // Execute Rule Validation on the playground text
  const handleValidatePlayground = async () => {
    setIsValidating(true);
    setValidationResult(null);

    try {
      const res = await fetch('/api/business/governance/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyText: playgroundText })
      });
      if (res.ok) {
        const data = await res.json();
        setValidationResult(data.governance);
      }
    } catch (err) {
      console.error('Failed to validate playground text:', err);
    } finally {
      setIsValidating(false);
    }
  };

  // Fetch Business Settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/business/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.context) {
            setProfile(data.context);
          }
        }
        
        const analyticsRes = await fetch('/api/business/analytics');
        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          if (analyticsData.analytics) {
            setAnalytics(analyticsData.analytics);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName || !newServicePrice) return;
    const newService = {
      id: crypto.randomUUID(),
      name: newServiceName,
      pricingType: 'fixed',
      priceMin: parseFloat(newServicePrice),
      durationDays: 30,
      scope: newServiceScope || 'Deliverables and scope variables.'
    };
    setServices([...services, newService]);
    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceScope('');
  };

  const handleRemoveService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const handleRuleToggle = (id: string) => {
    setActiveRules(activeRules.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await fetch('/api/business/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      setSaveSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full">
      
      {/* 1. Left-Side Admin Tab Navigation */}
      <aside className="w-full md:w-56 lg:w-64 border-b md:border-b-0 md:border-r border-slate-900 bg-slate-950 flex flex-row md:flex-col justify-start md:justify-between shrink-0 p-3 md:p-6 h-auto md:h-full overflow-x-auto md:overflow-x-visible gap-2 md:gap-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xs font-bold uppercase tracking-wider text-slate-500">ViveKit</h1>
              <h2 className="text-sm font-black text-slate-200">Control Center</h2>
            </div>
          </div>

          <div className="h-px bg-slate-900" />

          {/* Nav Buttons */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'profile' ? 'bg-slate-900 text-white shadow-inner' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Business Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'services' ? 'bg-slate-900 text-white shadow-inner' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Service Catalog</span>
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'rules' ? 'bg-slate-900 text-white shadow-inner' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Rule Engine</span>
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'voice' ? 'bg-slate-900 text-white shadow-inner' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Voice Calibration</span>
            </button>
            <button
              onClick={() => setActiveTab('governance')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'governance' ? 'bg-slate-900 text-white shadow-inner' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Response Governance</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'analytics' ? 'bg-slate-900 text-white shadow-inner' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Analytics OS</span>
            </button>
          </nav>
        </div>

        <div className="space-y-4">
          <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-bold text-slate-400">STATUS</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">Workspace isolated. Role: Systems Architect</p>
          </div>
          
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="w-full py-2 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg shadow-lg flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Alignment'}</span>
          </button>

          {saveSuccess && (
            <p className="text-[10px] font-bold text-emerald-400 text-center animate-fade-in">
              ✓ Operational sync complete!
            </p>
          )}
        </div>
      </aside>

      {/* 2. Main Dashboard Window */}
      <main className="flex-1 bg-slate-950 flex flex-col h-full overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-violet-500/20 to-transparent" />

        {/* Top Header */}
        <header className="h-14 shrink-0 border-b border-slate-900 px-4 sm:px-8 flex items-center justify-between z-10 bg-slate-950/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-xs font-bold capitalize">Workspace Console</span>
            <span className="text-slate-700 text-xs hidden sm:block">/</span>
            <span className="text-slate-200 text-xs font-semibold capitalize">{activeTab} alignment</span>
          </div>
        </header>

        {/* Inner Scrollable Workspace */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar z-10">
          
          {/* TAB 1: BUSINESS PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-lg font-black tracking-wide text-slate-100">Business Profile</h3>
                <p className="text-xs text-slate-500">Provide the central operational background for the ViveKit Prompt Engine.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 col-span-1">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Company Name</Label>
                  <input 
                    type="text"
                    value={profile.businessName}
                    onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5 col-span-1">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Website URL</Label>
                  <input 
                    type="text"
                    value={profile.websiteUrl}
                    onChange={(e) => setProfile({ ...profile, websiteUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Industry</Label>
                <input 
                  type="text"
                  value={profile.industry}
                  onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pricing Philosophy</Label>
                <textarea 
                  rows={2}
                  value={profile.pricingPhilosophy}
                  onChange={(e) => setProfile({ ...profile, pricingPhilosophy: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pricing & Discount Rules</Label>
                <textarea 
                  rows={2}
                  value={profile.pricingInstructions}
                  onChange={(e) => setProfile({ ...profile, pricingInstructions: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Operational & Delivery Boundaries</Label>
                <textarea 
                  rows={2}
                  value={profile.boundaries}
                  onChange={(e) => setProfile({ ...profile, boundaries: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: SERVICE CATALOG */}
          {activeTab === 'services' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h3 className="text-lg font-black tracking-wide text-slate-100">Service Profile Catalog</h3>
                <p className="text-xs text-slate-500">Publish productized agency offerings for the AI memory layers.</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {services.map((s) => (
                  <Card key={s.id} className="bg-slate-900/30 border border-slate-900 hover:border-slate-800 transition-all flex flex-col justify-between">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-slate-200">{s.name}</h4>
                        <span className="text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded capitalize">
                          {s.pricingType}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">{s.scope}</p>
                      <div className="h-px bg-slate-900/50" />
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-semibold text-slate-500">Authorized Price</span>
                        <span className="font-bold text-emerald-400">${s.priceMin.toLocaleString()}</span>
                      </div>
                    </CardContent>
                    <div className="p-3 bg-slate-900/10 border-t border-slate-900 flex justify-end">
                      <button 
                        onClick={() => handleRemoveService(s.id)}
                        className="p-1 rounded text-slate-650 hover:text-rose-500 hover:bg-rose-500/5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Add New Service Form */}
              <form onSubmit={handleAddService} className="p-5 rounded-xl border border-slate-900 bg-slate-900/10 space-y-4 max-w-xl">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-violet-400" />
                  <span>Register Productized Service</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1 col-span-1">
                    <Label className="text-[9px] text-slate-500 uppercase tracking-wider">Service Name</Label>
                    <input 
                      type="text" 
                      placeholder="e.g. AI Workflow Sprints"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <Label className="text-[9px] text-slate-500 uppercase tracking-wider">Starting Authorized Price ($)</Label>
                    <input 
                      type="number" 
                      placeholder="e.g. 7900"
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] text-slate-500 uppercase tracking-wider">Scope Limits & Delivery Commitments</Label>
                  <textarea 
                    rows={2} 
                    placeholder="Describe timeline limits, deliverables, and revision rules."
                    value={newServiceScope}
                    onChange={(e) => setNewServiceScope(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <button 
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Add Offer
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: RULE ENGINE */}
          {activeTab === 'rules' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h3 className="text-lg font-black tracking-wide text-slate-100">AI Operational Rule Engine</h3>
                <p className="text-xs text-slate-500">Configure strict bounds and triggers to prevent AI overpromising.</p>
              </div>

              <div className="space-y-3 max-w-2xl col-span-1">
                {activeRules.map((r) => (
                  <div key={r.id} className="p-3.5 rounded-xl border border-slate-900 bg-slate-900/10 flex justify-between items-center hover:border-slate-800 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">{r.trigger}</span>
                        <span className="text-[8px] font-bold bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.2 rounded uppercase">
                          {r.category}
                        </span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          r.action === 'block' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {r.action}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">{r.desc}</p>
                    </div>
                    <button
                      onClick={() => handleRuleToggle(r.id)}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold border transition-colors ${
                        r.active 
                          ? 'bg-violet-500/10 text-violet-400 border-violet-500/30' 
                          : 'bg-slate-900 text-slate-650 border-slate-800'
                      }`}
                    >
                      {r.active ? 'Rule Active' : 'Deactivated'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BRAND VOICE */}
          {activeTab === 'voice' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-lg font-black tracking-wide text-slate-100">Brand Voice Calibration</h3>
                <p className="text-xs text-slate-500">Fine-tune the AI brand voice style for conversational intelligence.</p>
              </div>

              {/* Selector */}
              <div className="flex gap-2 p-1 bg-slate-950 border border-slate-900 rounded-xl max-w-lg">
                {['premium', 'executive', 'consulting', 'friendly', 'specialist'].map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setSelectedVoice(tone)}
                    className={`flex-1 py-2 text-center rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                      selectedVoice === tone 
                        ? 'bg-slate-900 text-white shadow' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>

              {/* Advanced Sliders */}
              <div className="p-6 rounded-xl border border-slate-900 bg-slate-900/15 max-w-xl space-y-5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">Dynamic Sliders</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">Formality Density</span>
                    <span className="font-bold text-slate-200">{formalitySlider}% (High Formality)</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={formalitySlider}
                    onChange={(e) => setFormalitySlider(parseInt(e.target.value))}
                    className="w-full accent-violet-600"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">Emotional Resonance</span>
                    <span className="font-bold text-slate-200">{emotionSlider}% (Highly Reserved)</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={emotionSlider}
                    onChange={(e) => setEmotionSlider(parseInt(e.target.value))}
                    className="w-full accent-violet-600"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">Technical Vocabulary Depth</span>
                    <span className="font-bold text-slate-200">{techDepthSlider}% (Specialist Data)</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={techDepthSlider}
                    onChange={(e) => setTechDepthSlider(parseInt(e.target.value))}
                    className="w-full accent-violet-600"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">Persuasion Strategy Style</span>
                    <span className="font-bold text-slate-200">Consultative Selling</span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-600 rounded-full w-4/5" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RESPONSE GOVERNANCE PLAYGROUND */}
          {activeTab === 'governance' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h3 className="text-lg font-black tracking-wide text-slate-100">Response Governance Playground</h3>
                <p className="text-xs text-slate-500">Test proposed AI replies in the sandbox simulator to evaluate policy matches.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                
                {/* Validator Column */}
                <div className="space-y-4 col-span-1">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Proposed Text Draft</Label>
                  <textarea 
                    rows={8}
                    value={playgroundText}
                    onChange={(e) => setPlaygroundText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 leading-normal custom-scrollbar"
                  />
                  <button
                    onClick={handleValidatePlayground}
                    disabled={isValidating}
                    className="px-4 py-2 bg-slate-900 hover:border-slate-700 border border-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all text-slate-200"
                  >
                    {isValidating ? (
                      <span>Running policies...</span>
                    ) : (
                      <>
                        <Shield className="w-3.5 h-3.5 text-violet-400" />
                        <span>Validate Governance</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Audit Report Column */}
                <div className="col-span-1">
                  {validationResult ? (
                    <Card className="bg-slate-900/20 border border-slate-900 p-5 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-300">Operational Audit Report</h4>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                          validationResult.riskCategory === 'critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          validationResult.riskCategory === 'high' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        } uppercase tracking-wider`}>
                          {validationResult.riskCategory} risk
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-semibold text-slate-500">Governance Score</span>
                          <span className="font-bold text-slate-200">{100 - validationResult.riskScore} / 100</span>
                        </div>
                        <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${
                            validationResult.riskScore > 40 ? 'bg-rose-600' : 'bg-emerald-600'
                          }`} style={{ width: `${100 - validationResult.riskScore}%` }} />
                        </div>
                      </div>

                      <div className="h-px bg-slate-900" />

                      <div className="space-y-2">
                        <Label className="text-[9px] text-slate-500 uppercase tracking-wider">Policy Checklist Violations</Label>
                        {validationResult.violationDetails && validationResult.violationDetails.length > 0 ? (
                          validationResult.violationDetails.map((v: any, idx: number) => (
                            <div key={idx} className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/10 space-y-1">
                              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[10px]">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                <span>{v.ruleId}</span>
                              </div>
                              <p className="text-[9px] text-slate-400 leading-normal">{v.description}</p>
                              <div className="text-[8px] font-mono text-rose-500/60 pt-0.5">
                                Trigger keyword: {v.detectedPhrases.join(', ')}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                            <CheckCircle className="w-4 h-4 shrink-0" />
                            <span>Passed all operational compliance checks!</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  ) : (
                    <div className="h-full flex items-center justify-center border border-dashed border-slate-900 rounded-xl p-8 text-center text-slate-650">
                      <div className="space-y-2">
                        <Shield className="w-8 h-8 mx-auto text-slate-800" />
                        <p className="text-xs">Submit a text draft in the playground to run AI governance policies.</p>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Recent Audits Table */}
              <div className="space-y-3 pt-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Recent Audit Logs</h4>
                <div className="border border-slate-900 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900/50 border-b border-slate-900 text-slate-500 font-bold">
                        <th className="p-3">Time</th>
                        <th className="p-3">Proposed Output Preview</th>
                        <th className="p-3">Risk Level</th>
                        <th className="p-3">Violations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {recentAudits.map((a, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/20 transition-colors text-slate-300">
                          <td className="p-3 font-medium text-slate-500 whitespace-nowrap">{a.time}</td>
                          <td className="p-3 truncate max-w-xs">{a.text}</td>
                          <td className="p-3">
                            <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              a.risk === 'critical' ? 'bg-rose-500/10 text-rose-400' :
                              a.risk === 'high' ? 'bg-amber-500/10 text-amber-400' :
                              'bg-emerald-500/10 text-emerald-400'
                            }`}>
                              {a.risk}
                            </span>
                          </td>
                          <td className="p-3 text-[10px] text-slate-500">
                            {a.violations.length > 0 ? a.violations.join(', ') : 'None'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h3 className="text-lg font-black tracking-wide text-slate-100">Analytics OS</h3>
                <p className="text-xs text-slate-500">Analyze conversational yields, negotiation outcomes, and objection rates.</p>
              </div>

              {/* Dashboard Grid */}
              <div className="grid grid-cols-3 gap-4">
                
                {/* Metric A */}
                <Card className="bg-slate-900/30 border border-slate-900 p-4 space-y-3 col-span-1">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Average Retainer Yield</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-100">${analytics.negotiationOutcomes.averageContractValue}</h4>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-900 pt-2">
                    <span>Contracts Closed</span>
                    <span className="font-bold text-slate-200">{analytics.negotiationOutcomes.standardPricingAccepted}</span>
                  </div>
                </Card>

                {/* Metric B */}
                <Card className="bg-slate-900/30 border border-slate-900 p-4 space-y-3 col-span-1">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Objection Creep Index</span>
                    <Flame className="w-4 h-4 text-amber-500" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-100">
                    {analytics.objectionFrequency.pricingTooExpensive + analytics.objectionFrequency.scopeCreepRequest} Logged
                  </h4>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-900 pt-2">
                    <span>Scope Creeps Blocked</span>
                    <span className="font-bold text-slate-200">{analytics.objectionFrequency.scopeCreepRequest}</span>
                  </div>
                </Card>

                {/* Metric C */}
                <Card className="bg-slate-900/30 border border-slate-900 p-4 space-y-3 col-span-1">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">AI Suggestion Speed</span>
                    <Check className="w-4 h-4 text-violet-400" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-100">{analytics.aiSuggestionSuccess.approvedUntouched}%</h4>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-900 pt-2">
                    <span>Modified by Operator</span>
                    <span className="font-bold text-slate-200">{analytics.aiSuggestionSuccess.modifiedByAgent}%</span>
                  </div>
                </Card>

              </div>

              {/* Objections Chart mockup */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4">
                <div className="p-5 rounded-xl border border-slate-900 bg-slate-900/10 space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Objection Category Breakdown</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                        <span>Pricing Too Expensive</span>
                        <span>{analytics.objectionFrequency.pricingTooExpensive} events</span>
                      </div>
                      <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-600 rounded-full w-4/5" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                        <span>Scope Creep Attempt</span>
                        <span>{analytics.objectionFrequency.scopeCreepRequest} events</span>
                      </div>
                      <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full w-3/5" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                        <span>Timeline Limit Delay</span>
                        <span>{analytics.objectionFrequency.timelineTooLong} events</span>
                      </div>
                      <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full w-2/5" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-slate-900 bg-slate-900/10 space-y-4 flex flex-col justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Negotiation Strategy Conversion</h4>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    By applying value-based decision playbooks instead of lowering agency fees, ViveKit has defended pricing integrity across **84%** of recent conversations.
                  </p>
                  <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Defended Yield Rate</span>
                    </div>
                    <span className="text-xs font-black text-emerald-400">84% Success</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
