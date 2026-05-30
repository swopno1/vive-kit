import { NextResponse } from 'next/server';
import { createClient } from '../../../../../lib/supabase/server';
import { CRMBrainEngine } from '../../../../../lib/ai/crm-engine';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Client ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from('customer_profiles')
      .select(`
        *,
        crm_client_profiles (*),
        crm_client_behaviors (*),
        crm_relationship_scores (*),
        crm_client_timelines (*),
        crm_client_memories (*),
        crm_lead_qualifications (*)
      `)
      .eq('id', id)
      .single();

    if (error || !profile) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
    }

    const crmProfile = Array.isArray(profile.crm_client_profiles) ? profile.crm_client_profiles[0] : profile.crm_client_profiles;
    const behavior = Array.isArray(profile.crm_client_behaviors) ? profile.crm_client_behaviors[0] : profile.crm_client_behaviors;
    const scores = Array.isArray(profile.crm_relationship_scores) ? profile.crm_relationship_scores[0] : profile.crm_relationship_scores;

    // Compute strategic recommendation if behavior and scores exist
    let strategy = null;
    if (behavior && scores && crmProfile) {
      strategy = CRMBrainEngine.getStrategicRecommendation(behavior, scores, crmProfile);
    }

    return NextResponse.json({
      success: true,
      id,
      customerProfile: profile,
      crmProfile,
      behavior,
      scores,
      timeline: profile.crm_client_timelines ?? [],
      memories: profile.crm_client_memories ?? [],
      qualification: Array.isArray(profile.crm_lead_qualifications) ? profile.crm_lead_qualifications[0] : profile.crm_lead_qualifications,
      strategy,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API_CRM_CLIENT_DETAIL_GET_ERROR]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const updates: Record<string, unknown> = {};
    if (body.firstName !== undefined) updates.first_name = body.firstName;
    if (body.lastName !== undefined) updates.last_name = body.lastName;
    if (body.companyName !== undefined) updates.company_name = body.companyName;
    if (body.relationshipNotes !== undefined) updates.relationship_notes = body.relationshipNotes;

    if (Object.keys(updates).length > 0) {
      await supabase.from('customer_profiles').update(updates).eq('id', id);
    }

    if (body.lifecycleStage || body.segment || body.revenuePotential !== undefined) {
      await supabase.from('crm_client_profiles').upsert({
        customer_id: id,
        lifecycle_stage: body.lifecycleStage,
        client_segmentation: body.segment,
        revenue_potential: body.revenuePotential,
      }, { onConflict: 'customer_id' });
    }

    return NextResponse.json({ success: true, message: 'Client profile updated' });
  } catch (error: any) {
    console.error('[API_CRM_CLIENT_DETAIL_UPDATE_ERROR]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
