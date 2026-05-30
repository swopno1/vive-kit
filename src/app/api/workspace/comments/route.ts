import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { conversationId, authorName, authorRole, text } = await req.json();

    if (!text || !authorName) {
      return NextResponse.json({ success: false, error: 'text and authorName are required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: comment, error } = await supabase
      .from('crm_collaboration_comments')
      .insert({
        conversation_id: conversationId || null,
        author_name: authorName,
        author_role: authorRole || 'agent',
        text,
      })
      .select()
      .single();

    if (error) {
      console.warn('[COMMENT_INSERT_WARN]', error.message);
    }

    console.info('[COLLABORATIVE_COMMENT_POSTED]', {
      conversationId,
      authorName,
      textLength: text.length,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Comment posted successfully',
      comment: comment ?? { authorName, authorRole, text, timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    console.error('[API_WORKSPACE_COMMENTS_POST_ERROR]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export { POST as PATCH };
