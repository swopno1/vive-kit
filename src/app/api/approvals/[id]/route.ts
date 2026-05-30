import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { ApprovalEngine } from '../../../../lib/ai/approval-engine';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: workflow, error } = await supabase
      .from('crm_approval_workflows')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !workflow) {
      return NextResponse.json({ success: false, error: 'Approval workflow not found' }, { status: 404 });
    }

    const { data: auditLogs } = await supabase
      .from('crm_approval_audits')
      .select('*')
      .eq('workflow_id', id)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      success: true,
      workflow,
      auditLogs: auditLogs ?? [],
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API_APPROVAL_DETAIL_GET_ERROR]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { data: current, error: fetchError } = await supabase
      .from('crm_approval_workflows')
      .select('active_state, current_text, revisions_count')
      .eq('id', id)
      .single();

    if (fetchError || !current) {
      return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 });
    }

    const nextState = body.nextState || current.active_state;
    const newText = body.currentText || current.current_text;
    const didEdit = newText !== current.current_text;

    const { data: updated, error: updateError } = await supabase
      .from('crm_approval_workflows')
      .update({
        active_state: nextState,
        current_text: newText,
        revisions_count: didEdit ? current.revisions_count + 1 : current.revisions_count,
        assigned_reviewer: body.reviewer || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Insert audit log
    await supabase.from('crm_approval_audits').insert({
      workflow_id: id,
      action: body.action || 'edit',
      performed_by: body.reviewer || 'Operator',
      previous_state: current.active_state,
      next_state: nextState,
      text_delta: didEdit ? newText : null,
    });

    console.info('[APPROVAL_WORKFLOW_STATE_TRANSITIONED]', {
      workflowId: id,
      previousState: current.active_state,
      nextState,
      action: body.action,
    });

    return NextResponse.json({
      success: true,
      message: `Workflow state updated to ${nextState}`,
      workflow: updated,
    });
  } catch (error: any) {
    console.error('[API_APPROVAL_DETAIL_UPDATE_ERROR]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export { POST as PATCH };
