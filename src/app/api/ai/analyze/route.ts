import { NextResponse } from 'next/server';
import { IntelligenceEngine } from '../../../../lib/ai/intelligence/intelligence-engine';
import { retrievalEngine } from '../../../../lib/ai/memory/retrieval-engine';
import { chatRequestSchema } from '../../../../lib/validation';
import { SecurityEngine } from '../../../../lib/ai/security-engine';
import { RetrievalResult, ClientIntelligenceProfile } from '../../../../types';
import { parseUserProviderHeaders } from '../../../../lib/ai/providers/provider-factory';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validation = chatRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    // Prompt injection scan
    const scanResult = SecurityEngine.scanPromptInjection(validation.data.rawConversation);
    if (scanResult.isMalicious) {
      console.info('[SECURITY_BLOCKED] Prompt injection detected in /api/ai/analyze', { score: scanResult.score });
      return NextResponse.json({ error: 'Request blocked: potentially malicious input detected.' }, { status: 403 });
    }

    // Rate Limit check based on authenticated user
    const { createClient } = await import('../../../../lib/supabase/server');
    const { rateLimiter } = await import('../../../../lib/rate-limiter');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const rateLimitId = user?.id || user?.email || 'anonymous';

    const rateLimit = await rateLimiter.limit(`ai:${rateLimitId}`);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Rate limit exceeded.' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    const { rawConversation, businessContext, customerContext, additionalInstructions } = validation.data;
    const _userConfig = parseUserProviderHeaders(req); // available for future IntelligenceEngine wiring

    // Use the new Intelligence Engine for Phase 5
    const intelligence = await IntelligenceEngine.analyze({
      rawConversation,
      businessContext,
      customerContext,
      instructions: additionalInstructions,
    });

    // Phase 6: Fetch memories and profile if customer is available (and not placeholder dummy)
    let memories: RetrievalResult[] = [];
    let profile: ClientIntelligenceProfile | null = null;

    const isDummyId = customerContext?.id === '00000000-0000-0000-0000-000000000000';
    if (customerContext?.id && !isDummyId) {
      memories = await retrievalEngine.retrieve({
        query: rawConversation,
        customerId: customerContext.id,
        limit: 10
      });
      profile = await retrievalEngine.getClientProfile(customerContext.id);
    }

    return NextResponse.json({
      success: true,
      data: intelligence,
      memories,
      profile,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API_ANALYZE_ERROR]', error);
    return NextResponse.json({
      error: error.message || 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
