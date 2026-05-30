import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { ApprovalEngine } from '../../../lib/ai/approval-engine';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('crm_approval_workflows')
      .select(`
        *,
        conversations (id, channel, raw_history)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ success: true, queue: data ?? [] });
  } catch (error: any) {
    console.error('[API_APPROVALS_GET_ERROR]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { clientName, draftText, businessPriority, conversationId } = await req.json();

    if (!draftText) {
      return NextResponse.json({ success: false, error: 'draftText is required' }, { status: 400 });
    }

    const assessment = ApprovalEngine.evaluateDraftRisk(draftText);
    const supabase = await createClient();

    const { data: workflow, error } = await supabase
      .from('crm_approval_workflows')
      .insert({
        conversation_id: conversationId || null,
        client_name: clientName || 'Anonymous Client',
        active_state: assessment.score > 40 ? 'pending_review' : 'draft',
        risk_assessment: assessment,
        original_draft: draftText,
        current_text: draftText,
        revisions_count: 0,
        business_priority: businessPriority || 'profitability',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Draft queued for safety review',
      workflow,
    });
  } catch (error: any) {
    console.error('[API_APPROVALS_POST_ERROR]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
