'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap,
  Cpu, 
  Database, 
  TrendingUp, 
  Server, 
  Coins, 
  Clock, 
  ShieldAlert, 
  RefreshCw, 
  BarChart3, 
  Percent,
  Terminal,
  Activity,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';

// =========================================================================
// ViveKit - AI Cost Control & Performance Caching Console - Phase 14
// =========================================================================

export default function PerformanceConsole() {
  const [metrics, setMetrics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('routing');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Sandbox State: Manual Circuit Breaker
  const [breakerState, setBreakerState] = useState<'closed' | 'open' | 'half-open'>('closed');

  const fetchPerformanceMetrics = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/performance');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to fetch performance telemetry:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  useEffect(() => {
    fetchPerformanceMetrics();
  }, []);

  const handleTripBreaker = () => {
    const nextState = breakerState === 'closed' ? 'open' : 'closed';
    setBreakerState(nextState);
    
    // In production, sync status with background recovery handlers
    console.info(`[INFRASTRUCTURE_CIRCUIT_BREAKER] State updated manually: ${nextState.toUpperCase()}`);
  };

  return (
    <div className="flex flex-col h-full">
      
      {/* Top Header Section */}
      <header className="h-14 shrink-0 border-b border-slate-900 px-4 sm:px-8 flex items-center justify-between z-10 bg-slate-950/80 backdrop-blur-md relative">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-violet-500/20 to-transparent" />
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider hidden sm:block">Performance Engineering</span>
            <span className="text-slate-700 text-xs hidden sm:block">/</span>
            <span className="text-slate-200 text-xs font-semibold">Cost & Caching Control Center</span>
          </div>
        </div>

        <button
          onClick={fetchPerformanceMetrics}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white text-xs transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-violet-400' : ''}`} />
          <span>{isRefreshing ? 'Refreshing Engine...' : 'Sync Optimizer'}</span>
        </button>
      </header>

      {/* Main Performance Body */}
      {metrics ? (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar space-y-6 z-10">
          
          {/* ROW 1: PERFORMANCE & COST CONTROL HERO BANNER */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            
            {/* KPI 1: Tokens Consumed */}
            <Card className="bg-slate-900/20 border border-slate-900 p-5 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Tokens Consumed</span>
                <h3 className="text-2xl font-black text-slate-100">{metrics.costs.totalTokensUsed.toLocaleString()} Tokens</h3>
              </div>
              <div className="flex justify-between items-center text-[10px] pt-3 border-t border-slate-900/60 mt-3">
                <span className="text-slate-500 font-medium">Avg Token/Gen: 1,560</span>
                <span className="text-violet-400 font-bold flex items-center gap-0.5">
                  <Coins className="w-3.5 h-3.5" />
                  <span>Compressed</span>
                </span>
              </div>
            </Card>

            {/* KPI 2: Total spend (USD) */}
            <Card className="bg-slate-900/20 border border-slate-900 p-5 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">AI Model Spend (USD)</span>
                <h3 className="text-2xl font-black text-slate-100">${metrics.costs.totalCostUSD.toFixed(2)} USD</h3>
              </div>
              <div className="flex justify-between items-center text-[10px] pt-3 border-t border-slate-900/60 mt-3">
                <span className="text-slate-500 font-medium">Cost per Gen: $0.0034</span>
                <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>Efficient</span>
                </span>
              </div>
            </Card>

            {/* KPI 3: Savings generated */}
            <Card className="bg-slate-900/20 border border-slate-900 p-5 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Infrastructure Savings</span>
                <h3 className="text-2xl font-black text-emerald-400">+${metrics.costs.optimizationsSavedUSD.toFixed(2)}</h3>
              </div>
              <div className="flex justify-between items-center text-[10px] pt-3 border-t border-slate-900/60 mt-3">
                <span className="text-slate-500 font-medium">Flash routing yield: 72%</span>
                <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                  <Zap className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>Saved 81%</span>
                </span>
              </div>
            </Card>

            {/* KPI 4: Redis Hit Rates */}
            <Card className="bg-slate-900/20 border border-slate-900 p-5 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Redis Edge Cache Hit</span>
                <h3 className="text-2xl font-black text-slate-100">{metrics.caching.redisCacheHitRate}%</h3>
              </div>
              <div className="flex justify-between items-center text-[10px] pt-3 border-t border-slate-900/60 mt-3">
                <span className="text-slate-500 font-medium">Embedding Cache: $42.80 saved</span>
                <span className="text-violet-400 font-bold flex items-center gap-0.5">
                  <Database className="w-3 h-3 text-violet-400" />
                  <span>Upstash Edge</span>
                </span>
              </div>
            </Card>

          </div>

          {/* TAB SWAPPER FOR DIAGNOSTIC FOLDERS */}
          <div className="flex gap-1 p-1 bg-slate-950 border border-slate-900 rounded-xl overflow-x-auto">
            {[
              { id: 'routing', name: 'Inference Routing & Budgets', icon: Cpu },
              { id: 'cache', name: 'Cache & Resilience controls', icon: Database },
              { id: 'optimizer', name: 'Optimization Advisor Board', icon: Coins }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 text-center rounded-lg text-[10px] font-bold uppercase tracking-wider relative transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === tab.id 
                      ? 'bg-slate-900 text-white shadow' 
                      : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* ACTIVE DIAGNOSTIC VIEWS */}
          
          {/* TAB A: INFERENCE ROUTING & CONTEXT BUDGETS */}
          {activeTab === 'routing' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
              
              {/* Routing Logic Info Card */}
              <Card className="col-span-1 md:col-span-2 bg-slate-900/20 border border-slate-900 p-6 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-violet-400" />
                    <span>Dynamic Model Routing Strategy</span>
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1">Routes text between reasoning nodes, allocating Gemini Flash for 72% of workload requests.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-1">
                    <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Gemini Flash Allocation</span>
                    <h5 className="text-base font-black text-slate-200">{metrics.costs.modelCostShare['gemini-flash']}%</h5>
                    <p className="text-[10px] text-slate-500 pt-1">Loaded automatically for simple supports templates, draft revisions, and low-priority client profiles.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-1">
                    <span className="text-[9px] text-violet-400 font-bold uppercase tracking-wider">Gemini Pro Allocation</span>
                    <h5 className="text-base font-black text-slate-200">{metrics.costs.modelCostShare['gemini-pro']}%</h5>
                    <p className="text-[10px] text-slate-500 pt-1">Loaded automatically for complex timeline billing disputes, high retention objectives, or VIP VIP accounts.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-900/60 mt-4 space-y-2">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Router Active Decision Audit</span>
                  <p className="text-[11px] text-slate-350 italic">"{metrics.routing.rationale}"</p>
                </div>
              </Card>

              {/* Token budget gauge */}
              <Card className="col-span-1 bg-slate-900/20 border border-slate-900 p-6 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-violet-400" />
                    <span>Prompt Token Budget</span>
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1">Monitors the active context limits. reclaims space via conversation history compression.</p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Tokens In Use</span>
                    <span className="text-slate-200 font-bold">{metrics.tokenBudget.promptTokensUsed} / {metrics.tokenBudget.maxContextTokens}</span>
                  </div>
                  <div className="h-2 bg-slate-950 border border-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-600 rounded-full" style={{ width: `${(metrics.tokenBudget.promptTokensUsed / metrics.tokenBudget.maxContextTokens) * 100}%` }} />
                  </div>

                  <div className="pt-2 flex justify-between items-center text-[10px] border-t border-slate-900/60">
                    <span className="text-slate-500">Compression Yield</span>
                    <span className="text-emerald-400 font-bold">{metrics.tokenBudget.compressContextRatio}% Compressed</span>
                  </div>
                </div>
              </Card>

            </div>
          )}

          {/* TAB B: CACHE EFFICIENCY & INFRASTRUCTURE CIRCUIT BREAKERS */}
          {activeTab === 'cache' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
              
              {/* Redis edge indicators */}
              <Card className="col-span-1 md:col-span-2 bg-slate-900/20 border border-slate-900 p-6 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-violet-400" />
                    <span>Edge Caching & pgvector Speed</span>
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1">Tracks Redis query counts, local prompt caching statistics, and database vector latencies.</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-1">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Upstash Hit rate</span>
                    <h5 className="text-lg font-black text-slate-200">{metrics.caching.redisCacheHitRate}%</h5>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-1">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">vector query time</span>
                    <h5 className="text-lg font-black text-slate-200">{metrics.caching.vectorSearchLatencyMs}ms</h5>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-1">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">embed cash saved</span>
                    <h5 className="text-lg font-black text-emerald-400">${metrics.caching.embeddingCacheSavingsUSD.toFixed(2)}</h5>
                  </div>
                </div>
              </Card>

              {/* Circuit breaker controller sandbox */}
              <Card className="col-span-1 bg-slate-900/20 border border-slate-900 p-6 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-violet-400" />
                    <span>Provider Circuit Breaker</span>
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1">Manual switch to trigger emergency failovers if model APIs suffer high latencies.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-500 font-bold uppercase block">Breaker State</span>
                    <span className={`text-xs font-black uppercase tracking-wider ${
                      breakerState === 'closed' ? 'text-emerald-400' : 'text-rose-500 animate-pulse'
                    }`}>
                      {breakerState === 'closed' ? 'CLOSED (Normal)' : 'TRIPPED (Fallback)'}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleTripBreaker}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      breakerState === 'closed'
                        ? 'border-rose-550/20 bg-rose-500/10 text-rose-450 hover:bg-rose-500/20'
                        : 'border-emerald-550/20 bg-emerald-500/10 text-emerald-440 hover:bg-emerald-500/20'
                    }`}
                  >
                    {breakerState === 'closed' ? 'Trip Breaker' : 'Reset Breaker'}
                  </button>
                </div>
              </Card>

            </div>
          )}

          {/* TAB C: INFRASTRUCTURE OPTIMIZATION ADVISOR */}
          {activeTab === 'optimizer' && (
            <Card className="bg-slate-900/20 border border-slate-900 p-6 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-violet-400" />
                  <span>Infrastructure Optimizer Advice Board</span>
                </h4>
                <p className="text-[10px] text-slate-500 mt-1">Actionable advisory items compiled automatically to reduce inference budgets and accelerate latency performance.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {metrics.recommendations.map((rec: any) => (
                  <div key={rec.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-900 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="bg-violet-600/10 text-violet-400 border border-violet-500/10 text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest">
                          {rec.category.replace('_', ' ')}
                        </span>
                        <span className={`text-[8px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                          rec.impactScore === 'high' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-550/20' 
                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-550/20'
                        }`}>
                          {rec.impactScore} Impact
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-200 pt-1">{rec.title}</h5>
                      <p className="text-[10px] text-slate-500 leading-normal">{rec.description}</p>
                    </div>

                    <div className="flex justify-between items-center text-[10px] pt-3 border-t border-slate-900/60 mt-3">
                      <span className="text-slate-500">Estimated Monthly Savings</span>
                      <span className="text-emerald-400 font-bold">+${rec.estimatedSavingsUSD.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

        </div>
      ) : null}

    </div>
  );
}
