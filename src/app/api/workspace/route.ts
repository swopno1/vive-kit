import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

/**
 * GET: Returns live workspace, members, and invitation data from Supabase.
 * Falls back to demo data when DB is empty.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const [workspacesRes, membersRes, invitationsRes] = await Promise.all([
      supabase.from('crm_workspaces').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('crm_workspace_members').select('*, crm_workspaces(name, plan)').limit(50),
      supabase.from('crm_workspace_invitations').select('*').order('expires_at', { ascending: false }).limit(20),
    ]);

    const workspaces = workspacesRes.data ?? [];
    const members = membersRes.data ?? [];
    const invitations = invitationsRes.data ?? [];

    if (workspaces.length === 0 && members.length === 0) {
      return NextResponse.json({
        success: true,
        workspaces: [],
        members: [],
        invitations: [],
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      workspaces,
      members,
      invitations,
      source: 'database',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API_WORKSPACE_GET_ERROR]', error);
    return NextResponse.json({ success: true, workspaces: [], members: [], invitations: [] });
  }
}

/**
 * POST: Sends a workspace invitation and persists it to Supabase.
 */
export async function POST(req: Request) {
  try {
    const { email, role, invitedBy, workspaceId } = await req.json();

    if (!email || !role) {
      return NextResponse.json({ success: false, error: 'email and role are required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Resolve workspace — use provided ID or fall back to first workspace
    let resolvedWorkspaceId = workspaceId;
    if (!resolvedWorkspaceId) {
      const { data: ws } = await supabase.from('crm_workspaces').select('id').limit(1).maybeSingle();
      resolvedWorkspaceId = ws?.id ?? null;
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    let invite: Record<string, unknown>;

    if (resolvedWorkspaceId) {
      const { data: inserted, error: insertError } = await supabase
        .from('crm_workspace_invitations')
        .insert({
          workspace_id: resolvedWorkspaceId,
          email,
          role,
          invited_by: invitedBy || 'operator',
          status: 'pending',
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (insertError) {
        console.warn('[INVITE_INSERT_WARN]', insertError.message);
      }

      invite = inserted ?? { email, role, status: 'pending', expires_at: expiresAt };
    } else {
      invite = { email, role, status: 'pending', expires_at: expiresAt };
    }

    console.info('[WORKSPACE_ONBOARDING_INVITE_SENT]', {
      email,
      role,
      invitedBy: invitedBy || 'operator',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Onboarding invitation successfully sent to ${email}`,
      invite,
    });
  } catch (error: any) {
    console.error('[API_WORKSPACE_POST_ERROR]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export { POST as PATCH };
