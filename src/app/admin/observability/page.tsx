'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity,
  Cpu, 
  Database, 
  TrendingUp, 
  Server, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  RefreshCw, 
  Zap, 
  BarChart2, 
  Heart,
  Terminal,
  Layers,
  Percent
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';

// =========================================================================
// ViveKit - AI Performance Observability & Diagnostics Desk - Phase 12
// =========================================================================

export default function ObservabilityConsole() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('ai-quality');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMetrics = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/observability');
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data.metrics);
      }
    } catch (err) {
      console.error('Failed to fetch observability telemetry:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="flex flex-col h-full">
      
      {/* Top Header Section */}
      <header className="h-14 shrink-0 border-b border-slate-900 px-4 sm:px-8 flex items-center justify-between z-10 bg-slate-950/80 backdrop-blur-md relative">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-violet-500/20 to-transparent" />
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider hidden sm:block">Telemetry Platform</span>
            <span className="text-slate-700 text-xs hidden sm:block">/</span>
            <span className="text-slate-200 text-xs font-semibold">AI Quality & Diagnostics Desk</span>
          </div>
        </div>

        <button
          onClick={fetchMetrics}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white text-xs transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-violet-400' : ''}`} />
          <span>{isRefreshing ? 'Refreshing Hub...' : 'Sync Telemetry'}</span>
        </button>
      </header>

      {/* Main Observatory Body */}
      {dashboardData ? (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar space-y-6 z-10">
          
          {/* ROW 1: EXECUTIVE KEY PERFORMANCE INDICATORS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            
            {/* KPI 1: AI Prompt Acceptance */}
            <Card className="bg-slate-900/20 border border-slate-900 p-5 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">AI Prompt Acceptance</span>
                <h3 className="text-2xl font-black text-slate-100">{dashboardData.aiQuality.promptAcceptanceRate}%</h3>
              </div>
              <div className="flex justify-between items-center text-[10px] pt-3 border-t border-slate-900/60 mt-3">
                <span className="text-slate-500 font-medium">Acceptance target: &gt;85%</span>
                <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>Pass</span>
                </span>
              </div>
            </Card>

            {/* KPI 2: Avg Generation Latency */}
            <Card className="bg-slate-900/20 border border-slate-900 p-5 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Avg Model Latency</span>
                <h3 className="text-2xl font-black text-slate-100">{dashboardData.aiQuality.generationLatencyAvg}ms</h3>
              </div>
              <div className="flex justify-between items-center text-[10px] pt-3 border-t border-slate-900/60 mt-3">
                <span className="text-slate-500 font-medium">Gateway latency limit: 500ms</span>
                <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                  <Zap className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>Fast</span>
                </span>
              </div>
            </Card>

            {/* KPI 3: RAG Hit Rate */}
            <Card className="bg-slate-900/20 border border-slate-900 p-5 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">RAG Memory Hit Rate</span>
                <h3 className="text-2xl font-black text-slate-100">{dashboardData.ragDiagnostics.hitRateRatio}%</h3>
              </div>
              <div className="flex justify-between items-center text-[10px] pt-3 border-t border-slate-900/60 mt-3">
                <span className="text-slate-500 font-medium">Relevance threshold: &gt;90%</span>
                <span className="text-violet-400 font-bold flex items-center gap-0.5">
                  <Database className="w-3 h-3 text-violet-400" />
                  <span>Elite</span>
                </span>
              </div>
            </Card>

            {/* KPI 4: API Gateway Uptime */}
            <Card className="bg-slate-900/20 border border-slate-900 p-5 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">API Uptime Tick</span>
                <h3 className="text-2xl font-black text-slate-100">{dashboardData.systemHealth.apiUptimePercent}%</h3>
              </div>
              <div className="flex justify-between items-center text-[10px] pt-3 border-t border-slate-900/60 mt-3">
                <span className="text-slate-500 font-medium">Uptime target: 99.9%</span>
                <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                  <Server className="w-3 h-3 text-emerald-400" />
                  <span>Healthy</span>
                </span>
              </div>
            </Card>

          </div>

          {/* TAB SWAPPER FOR DIAGNOSTIC FOLDERS */}
          <div className="flex gap-1 p-1 bg-slate-950 border border-slate-900 rounded-xl overflow-x-auto">
            {[
              { id: 'ai-quality', name: 'AI Prompt & Quality', icon: Cpu },
              { id: 'rag-diagnostics', name: 'RAG & Retrieval', icon: Database },
              { id: 'business-outcomes', name: 'Business Outcomes', icon: TrendingUp },
              { id: 'system-health', name: 'Gateway & Workers', icon: Server }
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
          {activeTab === 'ai-quality' && (
            <Card className="bg-slate-900/20 border border-slate-900 p-6 space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-violet-400" />
                  <span>AI prompt and quality monitoring metrics</span>
                </h4>
                <p className="text-[10px] text-slate-500 mt-1">Tracks prompt efficiency, hallucination prevention indexes, and operator editing patterns.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                
                {/* Metric A: Hallucination rate */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Hallucination Frequency</span>
                    <span className="text-emerald-400">{(dashboardData.aiQuality.hallucinationFreqRatio * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${dashboardData.aiQuality.hallucinationFreqRatio * 100}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-500 block">Identifies unsupported external references or link anomalies.</span>
                </div>

                {/* Metric B: Manual modification rate */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Operator Modification Rate</span>
                    <span className="text-indigo-400">{dashboardData.aiQuality.editFrequencyRatio}%</span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${dashboardData.aiQuality.editFrequencyRatio}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-500 block">Measures the percentage of drafts manually customized by reviewers.</span>
                </div>

                {/* Metric C: Retry and recovery rates */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Model Retry Frequency</span>
                    <span className="text-emerald-400">{(dashboardData.aiQuality.retryRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${dashboardData.aiQuality.retryRate * 100}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-500 block">Measures model timeout rates or safety system re-trigger passes.</span>
                </div>

              </div>
            </Card>
          )}

          {activeTab === 'rag-diagnostics' && (
            <Card className="bg-slate-900/20 border border-slate-900 p-6 space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-violet-400" />
                  <span>Retrieval & Semantic Vector Diagnostics</span>
                </h4>
                <p className="text-[10px] text-slate-500 mt-1">Tracks retrieval relevance, context quality, memory hit rates, and embedding lookup speed.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                
                {/* Metric A: Relevance Avg */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Retrieval Relevance Score</span>
                    <span className="text-emerald-400">{dashboardData.ragDiagnostics.relevanceAvg}%</span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${dashboardData.ragDiagnostics.relevanceAvg}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-500 block">Measures vector distance match percentages in memory banks.</span>
                </div>

                {/* Metric B: Context utilization */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Context Utilized Ratio</span>
                    <span className="text-indigo-400">{dashboardData.ragDiagnostics.contextUtilizationRatio}%</span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${dashboardData.ragDiagnostics.contextUtilizationRatio}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-500 block">Reflects percentage of retrieved context tokens injected into prompt cycles.</span>
                </div>

                {/* Metric C: Retrieval Speed */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Avg Retrieval Latency</span>
                    <span className="text-emerald-400">{dashboardData.ragDiagnostics.avgRetrievalLatencyMs}ms</span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '10%' }} />
                  </div>
                  <span className="text-[9px] text-slate-500 block">Measures vector search execution speeds inside pg_vector indexes.</span>
                </div>

              </div>
            </Card>
          )}

          {activeTab === 'business-outcomes' && (
            <Card className="bg-slate-900/20 border border-slate-900 p-6 space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-violet-400" />
                  <span>Business Impact & Negotiation Analytics</span>
                </h4>
                <p className="text-[10px] text-slate-500 mt-1">Converts AI operational telemetry into client revenue retention and workflow time savings statistics.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                
                {/* Metric A: Client conversion */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Conversion Success Rate</span>
                    <span className="text-emerald-400">{dashboardData.outcomes.conversionSuccessRate}%</span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${dashboardData.outcomes.conversionSuccessRate}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-500 block">Measures positive client closings or invoice completions.</span>
                </div>

                {/* Metric B: ACV yields */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Average ACV Retainer Upsell</span>
                    <span className="text-indigo-400">+{dashboardData.outcomes.negotiationYield}%</span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${dashboardData.outcomes.negotiationYield}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-500 block">Reflects ACV uplifts from Premium pricing suggestions.</span>
                </div>

                {/* Metric C: Hours saved */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Workflow Hours Saved</span>
                    <span className="text-emerald-400">{dashboardData.outcomes.workflowEfficiencyHoursSaved} Hours</span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '80%' }} />
                  </div>
                  <span className="text-[9px] text-slate-500 block">Aggregated time-saving yields compiled across draft operators.</span>
                </div>

              </div>
            </Card>
          )}

          {activeTab === 'system-health' && (
            <Card className="bg-slate-900/20 border border-slate-900 p-6 space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-violet-400" />
                  <span>Gateway Health & Pipeline Load Metrics</span>
                </h4>
                <p className="text-[10px] text-slate-500 mt-1">Tracks system queue volumes, worker loads, vector query latencies, and pipeline failures.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                
                {/* Metric A: active workers */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Active Pipeline Workers</span>
                    <span className="text-emerald-400">{dashboardData.systemHealth.activeWorkersCount} Active</span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
                  </div>
                  <span className="text-[9px] text-slate-500 block">Number of live workers processing embeds and background vector writes.</span>
                </div>

                {/* Metric B: Vector DB speeds */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Vector Query Latency</span>
                    <span className="text-indigo-400">{dashboardData.systemHealth.vectorDbLatencyMs}ms</span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '12%' }} />
                  </div>
                  <span className="text-[9px] text-slate-500 block">Measures basic DB transaction search latencies inside pg_vector.</span>
                </div>

                {/* Metric C: Queue Backlog */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Queue Backlog Count</span>
                    <span className="text-emerald-400">{dashboardData.systemHealth.queueBacklogCount} In Queue</span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '0%' }} />
                  </div>
                  <span className="text-[9px] text-slate-500 block">Measures pending background processes or unscheduled RAG indexes.</span>
                </div>

              </div>
            </Card>
          )}

          {/* REAL-TIME ANALYTICAL LIVE EVENT STREAM */}
          <Card className="bg-slate-900/30 border border-slate-900 p-6 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Real-Time Observability Event Stream</span>
            </h4>

            <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-950">
              <table className="w-full text-[11px] text-slate-400 border-collapse">
                <thead>
                  <tr className="bg-slate-900/40 text-slate-500 border-b border-slate-900 font-bold uppercase tracking-wider text-[9px]">
                    <th className="py-2.5 px-4 text-left">Event Type</th>
                    <th className="py-2.5 px-4 text-left">Timestamp</th>
                    <th className="py-2.5 px-4 text-left">Duration</th>
                    <th className="py-2.5 px-4 text-left">Log Details</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60 font-mono">
                  {dashboardData.recentEvents.map((evt: any) => (
                    <tr key={evt.id} className="hover:bg-slate-900/10 transition-colors">
                      <td className="py-2.5 px-4 font-bold capitalize text-slate-350">{evt.eventType}</td>
                      <td className="py-2.5 px-4 text-slate-500">{new Date(evt.timestamp).toLocaleTimeString()}</td>
                      <td className="py-2.5 px-4 text-indigo-400">{evt.durationMs}ms</td>
                      <td className="py-2.5 px-4 text-slate-400 font-sans">{evt.message}</td>
                      <td className="py-2.5 px-4 text-right">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold uppercase px-1.5 py-0.2 rounded">
                          Pass
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

        </div>
      ) : null}

    </div>
  );
}
