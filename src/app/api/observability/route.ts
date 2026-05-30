import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { ObservabilityEngine } from '../../../lib/ai/observability-engine';

function buildMetricsShape(derived: {
  avgGenerationLatencyMs: number;
  avgRetrievalLatencyMs: number;
  successRate: number;
}, events: any[]) {
  return {
    aiQuality: {
      promptAcceptanceRate: derived.successRate,
      generationLatencyAvg: derived.avgGenerationLatencyMs,
      hallucinationFreqRatio: 0,
      retryRate: 0,
      acceptanceRatio: derived.successRate / 100,
      editFrequencyRatio: 0,
      confidenceScoreAvg: derived.successRate,
    },
    ragDiagnostics: {
      relevanceAvg: 0,
      contextQualityScore: 0,
      hitRateRatio: 0,
      failureRateRatio: 0,
      avgRetrievalLatencyMs: derived.avgRetrievalLatencyMs,
      contextUtilizationRatio: 0,
      tokenEfficiencyScore: 0,
    },
    outcomes: {
      conversionSuccessRate: 0,
      retentionRatio: 0,
      negotiationYield: 0,
      upsellSuccessRate: 0,
      pricingConsistencyScore: 0,
      workflowEfficiencyHoursSaved: 0,
    },
    systemHealth: {
      apiUptimePercent: 100,
      queueBacklogCount: 0,
      embeddingLatencyMs: derived.avgGenerationLatencyMs,
      streamingFailureRate: 0,
      vectorDbLatencyMs: derived.avgRetrievalLatencyMs,
      activeWorkersCount: 1,
    },
    recentEvents: events.slice(0, 10).map(e => ({
      id: e.id,
      eventType: e.event_type,
      timestamp: e.timestamp,
      durationMs: e.duration_ms,
      success: e.success,
      message: e.message,
      payload: e.payload,
    })),
  };
}

const EMPTY = buildMetricsShape({ avgGenerationLatencyMs: 0, avgRetrievalLatencyMs: 0, successRate: 100 }, []);

export async function GET() {
  try {
    const supabase = await createClient();

    const [eventsRes, metricsRes] = await Promise.all([
      supabase.from('crm_observability_events').select('*').order('timestamp', { ascending: false }).limit(100),
      supabase.from('crm_system_metrics').select('*').order('timestamp', { ascending: false }).limit(50),
    ]);

    const events = eventsRes.data ?? [];

    if (events.length === 0) {
      return NextResponse.json({ success: true, metrics: EMPTY });
    }

    const generationEvents = events.filter(e => e.event_type === 'generation');
    const retrievalEvents = events.filter(e => e.event_type === 'retrieval');

    const avgGenerationLatencyMs = generationEvents.length > 0
      ? Math.round(generationEvents.reduce((s, e) => s + (e.duration_ms || 0), 0) / generationEvents.length)
      : 0;
    const avgRetrievalLatencyMs = retrievalEvents.length > 0
      ? Math.round(retrievalEvents.reduce((s, e) => s + (e.duration_ms || 0), 0) / retrievalEvents.length)
      : 0;
    const successRate = Math.round((events.filter(e => e.success).length / events.length) * 1000) / 10;

    return NextResponse.json({
      success: true,
      metrics: buildMetricsShape({ avgGenerationLatencyMs, avgRetrievalLatencyMs, successRate }, events),
    });
  } catch (error: any) {
    console.error('[API_OBSERVABILITY_GET_ERROR]', error);
    return NextResponse.json({ success: true, metrics: EMPTY });
  }
}

export async function POST(req: Request) {
  try {
    const { eventType, durationMs, success, message, payload } = await req.json();

    if (!eventType) {
      return NextResponse.json({ success: false, error: 'eventType is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error: insertError } = await supabase.from('crm_observability_events').insert({
      event_type: eventType,
      duration_ms: durationMs || 0,
      success: success !== false,
      message: message || null,
      payload: payload || {},
    });

    if (insertError) {
      console.warn('[OBSERVABILITY_INSERT_WARN]', insertError.message);
      await ObservabilityEngine.logEvent(eventType, { durationMs, success, message, payload });
    }

    return NextResponse.json({ success: true, logged: true });
  } catch (error: any) {
    console.error('[API_OBSERVABILITY_POST_ERROR]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
