import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { PerformanceEngine } from '../../../lib/ai/performance-engine';

function buildPerformanceShape(cost: { totalTokens: number; totalCostUSD: number; flashPercent: number; proPercent: number }, perf: { redisHitRate: number; vectorLatencyMs: number; circuitBreakerState: string }) {
  return {
    routing: {
      modelChosen: cost.flashPercent >= 50 ? 'gemini-flash' : 'gemini-pro',
      rationale: cost.totalTokens > 0
        ? `${cost.flashPercent}% of requests routed to Gemini 2.0 Flash, ${cost.proPercent}% to Gemini 2.0 Pro.`
        : 'No requests recorded yet.',
      complexityScore: 0,
      promptTokensForecast: 0,
      estimatedCostUSD: 0,
    },
    tokenBudget: {
      maxContextTokens: 8192,
      promptTokensUsed: cost.totalTokens,
      completionTokensUsed: 0,
      budgetRemaining: Math.max(0, 8192 - cost.totalTokens),
      compressContextRatio: 0,
    },
    caching: {
      redisCacheHitRate: perf.redisHitRate,
      inMemoryHitRate: 0,
      vectorSearchLatencyMs: perf.vectorLatencyMs,
      embeddingCacheSavingsUSD: 0,
    },
    circuitBreaker: {
      state: perf.circuitBreakerState,
      failureCount: 0,
      recoveryAttempts: 0,
    },
    costs: {
      totalTokensUsed: cost.totalTokens,
      totalCostUSD: cost.totalCostUSD,
      avgCostPerGenerationUSD: 0,
      modelCostShare: {
        'gemini-flash': cost.flashPercent,
        'gemini-pro': cost.proPercent,
      },
      optimizationsSavedUSD: 0,
    },
    recommendations: [],
  };
}

const EMPTY = buildPerformanceShape(
  { totalTokens: 0, totalCostUSD: 0, flashPercent: 0, proPercent: 0 },
  { redisHitRate: 0, vectorLatencyMs: 0, circuitBreakerState: 'closed' }
);

export async function GET() {
  try {
    const supabase = await createClient();

    const [costRes, perfRes] = await Promise.all([
      supabase.from('crm_cost_observability').select('*').order('timestamp', { ascending: false }).limit(100),
      supabase.from('crm_performance_metrics').select('*').order('timestamp', { ascending: false }).limit(1),
    ]);

    const costRows = costRes.data ?? [];
    const latestPerf = perfRes.data?.[0] ?? null;

    if (costRows.length === 0 && !latestPerf) {
      return NextResponse.json({ success: true, metrics: EMPTY });
    }

    const totalTokens = costRows.reduce((s, r) => s + (r.tokens_used || 0), 0);
    const totalCostUSD = costRows.reduce((s, r) => s + (r.cost_usd || 0), 0);
    const flashRows = costRows.filter(r => r.model_name?.includes('flash'));
    const flashPercent = costRows.length > 0 ? Math.round((flashRows.length / costRows.length) * 100) : 0;

    return NextResponse.json({
      success: true,
      metrics: buildPerformanceShape(
        { totalTokens, totalCostUSD: Math.round(totalCostUSD * 10000) / 10000, flashPercent, proPercent: 100 - flashPercent },
        {
          redisHitRate: latestPerf?.redis_hit_rate ?? 0,
          vectorLatencyMs: latestPerf?.vector_latency_ms ?? 0,
          circuitBreakerState: latestPerf?.circuit_breaker_state ?? 'closed',
        }
      ),
    });
  } catch (error: any) {
    console.error('[API_PERFORMANCE_GET_ERROR]', error);
    return NextResponse.json({ success: true, metrics: EMPTY });
  }
}

export async function POST(req: Request) {
  try {
    const { promptText, priority, clientArchetype } = await req.json();

    if (!promptText) {
      return NextResponse.json({ success: false, error: 'promptText is required' }, { status: 400 });
    }

    const decision = PerformanceEngine.determineRouting(promptText, priority || 'neutral', clientArchetype || 'growth');

    try {
      const supabase = await createClient();
      await supabase.from('crm_cost_observability').insert({
        workspace_id: 'default',
        tokens_used: decision.promptTokensForecast || 0,
        cost_usd: decision.estimatedCostUSD || 0,
        model_name: decision.modelChosen || 'gemini-flash',
      });
    } catch (dbErr) {
      console.warn('[COST_LOG_WARN]', dbErr);
    }

    return NextResponse.json({ success: true, decision, timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.error('[API_PERFORMANCE_POST_ERROR]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
