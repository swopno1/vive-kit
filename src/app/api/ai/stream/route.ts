import { aiService } from '../../../../lib/ai/ai.service';
import { chatRequestSchema } from '../../../../lib/validation';
import { SecurityEngine } from '../../../../lib/ai/security-engine';
import { parseUserProviderHeaders } from '../../../../lib/ai/providers/provider-factory';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = chatRequestSchema.safeParse(body);

    if (!validation.success) {
      return new Response(JSON.stringify({ error: validation.error.issues.map(i => i.message).join('; ') }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Prompt injection scan
    const scanResult = SecurityEngine.scanPromptInjection(validation.data.rawConversation);
    if (scanResult.isMalicious) {
      console.info('[SECURITY_BLOCKED] Prompt injection detected in /api/ai/stream', { score: scanResult.score });
      return new Response(JSON.stringify({ error: 'Request blocked: potentially malicious input detected.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rate Limit check based on authenticated user
    const { createClient } = await import('../../../../lib/supabase/server');
    const { rateLimiter } = await import('../../../../lib/rate-limiter');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const rateLimitId = user?.id || user?.email || 'anonymous';

    const rateLimit = await rateLimiter.limit(`ai:${rateLimitId}`);
    if (!rateLimit.success) {
      return new Response(JSON.stringify({ error: 'Too many requests. Rate limit exceeded.' }), {
        status: 429,
        headers: { 
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
        },
      });
    }

    const userConfig = parseUserProviderHeaders(req);

    const stream = await aiService.stream({
      task: 'reply',
      ...validation.data,
      complexity: validation.data.rawConversation.length > 1000 ? 'high' : 'low',
    }, userConfig);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('[API_STREAM_ERROR]', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
