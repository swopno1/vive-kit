'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';

// =========================================================================
// ViveKit - Simple Usage Log Dashboard
// =========================================================================

export default function UsageLog() {
  const [metrics, setMetrics] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const res = await fetch('/api/observability');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
      } else {
        setError('Failed to load metrics');
      }
    } catch (err) {
      setError('Error fetching usage data');
      console.error('Failed to fetch observability telemetry:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const getStatusColor = (value: number, threshold: number, inverted: boolean = false) => {
    if (inverted) {
      return value <= threshold ? 'emerald' : value <= threshold * 1.2 ? 'amber' : 'red';
    }
    return value >= threshold ? 'emerald' : value >= threshold * 0.8 ? 'amber' : 'red';
  };

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <header className="h-14 shrink-0 border-b border-slate-900 px-4 sm:px-8 flex items-center justify-between z-10 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-violet-400" />
          <span className="text-slate-200 text-sm font-semibold">Usage Log</span>
        </div>

        <button
          onClick={fetchMetrics}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white text-xs transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-violet-400' : ''}`} />
          <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar">

        {error ? (
          <div className="flex items-center justify-center h-full">
            <Card className="bg-red-500/10 border border-red-500/20 p-6 max-w-md">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-red-300">{error}</h3>
                  <p className="text-xs text-red-200 mt-1">Try refreshing the page or check your connection.</p>
                </div>
              </div>
            </Card>
          </div>
        ) : metrics ? (
          <div className="space-y-6">

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Metric 1: Total Prompts */}
              <Card className="bg-slate-900/30 border border-slate-900 overflow-hidden hover:border-slate-800 transition-colors">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Conversations</span>
                    <MessageSquare className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-slate-100">
                      {metrics.aiQuality?.totalPromptsProcessed || 0}
                    </h3>
                    <p className="text-xs text-slate-500">Conversations processed</p>
                  </div>
                </CardContent>
              </Card>

              {/* Metric 2: Avg Latency */}
              <Card className="bg-slate-900/30 border border-slate-900 overflow-hidden hover:border-slate-800 transition-colors">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Avg Response Time</span>
                    <Zap className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-slate-100">
                      {metrics.aiQuality?.generationLatencyAvg || 0}ms
                    </h3>
                    <p className="text-xs text-slate-500">Response generation latency</p>
                  </div>
                </CardContent>
              </Card>

              {/* Metric 3: Acceptance Rate */}
              <Card className="bg-slate-900/30 border border-slate-900 overflow-hidden hover:border-slate-800 transition-colors">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Acceptance Rate</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-slate-100">
                      {metrics.aiQuality?.promptAcceptanceRate || 0}%
                    </h3>
                    <p className="text-xs text-slate-500">Approved responses</p>
                  </div>
                </CardContent>
              </Card>

              {/* Metric 4: Error Count */}
              <Card className="bg-slate-900/30 border border-slate-900 overflow-hidden hover:border-slate-800 transition-colors">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Generation Errors</span>
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-slate-100">
                      {metrics.aiQuality?.totalErrors || 0}
                    </h3>
                    <p className="text-xs text-slate-500">Failed response attempts</p>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Summary Section */}
            <Card className="bg-slate-900/20 border border-slate-900 p-5">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3">Quick Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between items-center p-2 rounded bg-slate-950/40">
                  <span className="text-slate-400">Success Rate</span>
                  <span className="font-semibold text-emerald-400">
                    {metrics.aiQuality?.totalPromptsProcessed > 0
                      ? Math.round((metrics.aiQuality?.promptAcceptanceRate || 0)) + '%'
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-slate-950/40">
                  <span className="text-slate-400">Avg Response Time</span>
                  <span className="font-semibold text-slate-200">
                    {metrics.aiQuality?.generationLatencyAvg || 0}ms
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-slate-950/40">
                  <span className="text-slate-400">Total Processed</span>
                  <span className="font-semibold text-slate-200">
                    {metrics.aiQuality?.totalPromptsProcessed || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-slate-950/40">
                  <span className="text-slate-400">Error Rate</span>
                  <span className={`font-semibold ${(metrics.aiQuality?.totalErrors || 0) > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {metrics.aiQuality?.totalPromptsProcessed > 0
                      ? Math.round(((metrics.aiQuality?.totalErrors || 0) / metrics.aiQuality?.totalPromptsProcessed) * 100) + '%'
                      : '0%'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Info Section */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-lg p-4">
              <p className="text-xs text-slate-400">
                This dashboard shows real-time usage metrics for your AI responses.
                <strong> Last updated:</strong> {new Date().toLocaleTimeString()}
              </p>
            </div>

          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin inline-block mb-3">
                <RefreshCw className="w-6 h-6 text-violet-400" />
              </div>
              <p className="text-sm text-slate-400">Loading usage metrics...</p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
