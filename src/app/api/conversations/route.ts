import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { z } from 'zod';

const saveSchema = z.object({
  rawConversation: z.string().min(1).max(50000),
  generatedReply: z.string().min(1),
  customerId: z.string().uuid().optional(),
  channel: z.enum(['email', 'chat', 'sms']).default('email'),
  promptUsed: z.string().optional(),
});

/**
 * POST: Persists an approved conversation + reply to the database.
 * Creates a `conversations` record and a `suggested_replies` record with status = 'approved'.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = saveSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.format() }, { status: 400 });
    }

    const { rawConversation, generatedReply, customerId, channel, promptUsed } = validation.data;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Resolve customer_id — use provided UUID or look up by authenticated user's email
    let resolvedCustomerId: string | null = customerId || null;

    if (!resolvedCustomerId && user?.email) {
      const { data: profile } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();
      resolvedCustomerId = profile?.id || null;
    }

    // Insert conversation record
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        customer_id: resolvedCustomerId,
        channel,
        raw_history: rawConversation,
      })
      .select('id')
      .single();

    if (convError) {
      console.error('[CONVERSATION_INSERT_ERROR]', convError);
      return NextResponse.json({ success: false, error: 'Failed to save conversation' }, { status: 500 });
    }

    // Insert approved suggested reply
    const { data: reply, error: replyError } = await supabase
      .from('suggested_replies')
      .insert({
        conversation_id: conversation.id,
        prompt_used: promptUsed || 'ViveKit AI Orchestrator',
        generated_reply: generatedReply,
        status: 'approved',
        approved_by: user?.id || null,
      })
      .select('id')
      .single();

    if (replyError) {
      console.error('[REPLY_INSERT_ERROR]', replyError);
    }

    console.info('[CONVERSATION_PERSISTED]', {
      conversationId: conversation.id,
      replyId: reply?.id,
      customerId: resolvedCustomerId,
    });

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      replyId: reply?.id || null,
    });

  } catch (error: any) {
    console.error('[CONVERSATIONS_API_ERROR]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * GET: Returns the most recent 20 conversations for the authenticated user.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
      .from('conversations')
      .select(`
        id,
        channel,
        raw_history,
        created_at,
        customer_id,
        suggested_replies (id, status, generated_reply, created_at)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    // Filter by current user's customer profile if available
    if (user?.email) {
      const { data: profile } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();
      if (profile?.id) {
        query = query.eq('customer_id', profile.id);
      }
    }

    const { data: conversations, error } = await query;

    if (error) {
      console.error('[CONVERSATIONS_GET_ERROR]', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, conversations: conversations || [] });

  } catch (error: any) {
    console.error('[CONVERSATIONS_API_ERROR]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
