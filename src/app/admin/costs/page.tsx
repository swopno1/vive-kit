'use client';

import React, { useState, useEffect } from 'react';
import {
  Coins,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  DollarSign
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';

// =========================================================================
// ViveKit - Simple AI Costs Dashboard
// =========================================================================

export default function CostsDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const res = await fetch('/api/performance');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
      } else {
        setError('Failed to load cost metrics');
      }
    } catch (err) {
      setError('Error fetching cost data');
      console.error('Failed to fetch performance telemetry:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  // Calculate estimated monthly cost from daily consumption
  const estimateMonthlyFromDaily = (dailyCost: number) => {
    return (dailyCost * 30).toFixed(2);
  };

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <header className="h-14 shrink-0 border-b border-slate-900 px-4 sm:px-8 flex items-center justify-between z-10 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-200 text-sm font-semibold">AI Costs</span>
        </div>

        <button
          onClick={fetchMetrics}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white text-xs transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar">

        {error ? (
          <div className="flex items-center justify-center h-full">
            <Card className="bg-red-500/10 border border-red-500/20 p-6 max-w-md">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-red-300">{error}</h3>
                  <p className="text-xs text-red-200 mt-1">Try refreshing the page or check your connection.</p>
                </div>
              </div>
            </Card>
          </div>
        ) : metrics ? (
          <div className="space-y-6">

            {/* Top Row: Key Cost Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Metric 1: Tokens Per Day */}
              <Card className="bg-slate-900/30 border border-slate-900 overflow-hidden hover:border-slate-800 transition-colors">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Tokens Per Day</span>
                    <TrendingUp className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-slate-100">
                      {metrics.costs?.totalTokensUsed?.toLocaleString() || 0}
                    </h3>
                    <p className="text-xs text-slate-500">Token consumption</p>
                  </div>
                </CardContent>
              </Card>

              {/* Metric 2: Est. Monthly Cost */}
              <Card className="bg-slate-900/30 border border-slate-900 overflow-hidden hover:border-slate-800 transition-colors">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Est. Monthly Cost</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-slate-100">
                      ${estimateMonthlyFromDaily(metrics.costs?.totalCostUSD || 0)}
                    </h3>
                    <p className="text-xs text-slate-500">Projected monthly spend</p>
                  </div>
                </CardContent>
              </Card>

              {/* Metric 3: Total Spent (To Date) */}
              <Card className="bg-slate-900/30 border border-slate-900 overflow-hidden hover:border-slate-800 transition-colors">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Spent</span>
                    <Coins className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-slate-100">
                      ${(metrics.costs?.totalCostUSD || 0).toFixed(2)}
                    </h3>
                    <p className="text-xs text-slate-500">All-time spending</p>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Provider Breakdown */}
            <Card className="bg-slate-900/20 border border-slate-900 p-5">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-4">Cost by Provider</h3>

              <div className="space-y-3">
                {/* Gemini */}
                {metrics.costs?.modelCostShare?.['gemini-flash'] !== undefined && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40 hover:bg-slate-950/60 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-2 h-2 rounded-full bg-violet-400" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-200">Google Gemini</p>
                        <p className="text-xs text-slate-500">{metrics.costs?.modelCostShare?.['gemini-flash'] || 0}% of usage</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">
                      ${((metrics.costs?.totalCostUSD || 0) * ((metrics.costs?.modelCostShare?.['gemini-flash'] || 0) / 100)).toFixed(2)}
                    </span>
                  </div>
                )}

                {/* OpenAI */}
                {metrics.costs?.modelCostShare?.['openai'] !== undefined && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40 hover:bg-slate-950/60 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-200">OpenAI</p>
                        <p className="text-xs text-slate-500">{metrics.costs?.modelCostShare?.['openai'] || 0}% of usage</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">
                      ${((metrics.costs?.totalCostUSD || 0) * ((metrics.costs?.modelCostShare?.['openai'] || 0) / 100)).toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Anthropic */}
                {metrics.costs?.modelCostShare?.['anthropic'] !== undefined && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40 hover:bg-slate-950/60 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-2 h-2 rounded-full bg-indigo-400" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-200">Anthropic Claude</p>
                        <p className="text-xs text-slate-500">{metrics.costs?.modelCostShare?.['anthropic'] || 0}% of usage</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">
                      ${((metrics.costs?.totalCostUSD || 0) * ((metrics.costs?.modelCostShare?.['anthropic'] || 0) / 100)).toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Fallback if no provider data */}
                {!metrics.costs?.modelCostShare && (
                  <div className="p-3 rounded-lg bg-slate-950/40 text-center">
                    <p className="text-xs text-slate-500">No provider breakdown available yet</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Cost Summary Section */}
            <Card className="bg-slate-900/20 border border-slate-900 p-5">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3">Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between items-center p-2 rounded bg-slate-950/40">
                  <span className="text-slate-400">Cost Per 1K Tokens</span>
                  <span className="font-semibold text-slate-200">
                    ${metrics.costs?.totalTokensUsed > 0
                      ? ((metrics.costs?.totalCostUSD / (metrics.costs?.totalTokensUsed / 1000))).toFixed(4)
                      : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-slate-950/40">
                  <span className="text-slate-400">Avg Cost Per Response</span>
                  <span className="font-semibold text-slate-200">
                    ${((metrics.costs?.totalCostUSD / (metrics.aiQuality?.totalPromptsProcessed || 1))).toFixed(4)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Footer Info */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-lg p-4">
              <p className="text-xs text-slate-400">
                <strong>Note:</strong> Monthly estimate assumes daily consumption continues.
                <strong> Last updated:</strong> {new Date().toLocaleTimeString()}
              </p>
            </div>

          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin inline-block mb-3">
                <RefreshCw className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-sm text-slate-400">Loading cost metrics...</p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
