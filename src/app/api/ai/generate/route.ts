import { NextResponse } from 'next/server';
import { aiService } from '../../../../lib/ai/ai.service';
import { chatRequestSchema } from '../../../../lib/validation';
import { SecurityEngine } from '../../../../lib/ai/security-engine';
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
      console.info('[SECURITY_BLOCKED] Prompt injection detected in /api/ai/generate', { score: scanResult.score });
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

    const userConfig = parseUserProviderHeaders(req);

    const response = await aiService.generate({
      task: 'reply',
      ...validation.data,
      complexity: validation.data.rawConversation.length > 1000 ? 'high' : 'low',
    }, userConfig);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[API_GENERATE_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
