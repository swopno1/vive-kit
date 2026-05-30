import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';

/**
 * GET: Returns live CRM client profiles from Supabase.
 * Falls back to demo profiles when DB is empty.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Join customer_profiles with crm_client_profiles and crm_relationship_scores
    const { data: profiles, error } = await supabase
      .from('customer_profiles')
      .select(`
        id,
        email,
        first_name,
        last_name,
        company_name,
        relationship_notes,
        created_at,
        crm_client_profiles (
          lifecycle_stage,
          client_segmentation,
          strategic_importance,
          account_status,
          revenue_potential,
          lifetime_value_est,
          payment_reliability
        ),
        crm_relationship_scores (
          trust_score,
          relationship_strength,
          trajectory_trend,
          churn_risk_score,
          satisfaction_indicator
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.warn('[CRM_CLIENTS_QUERY_WARN]', error.message);
    }

    const liveProfiles = profiles ?? [];

    if (liveProfiles.length === 0) {
      return NextResponse.json({ success: true, clients: [] });
    }

    // Normalize live profiles into a consistent shape
    const clients = liveProfiles.map(p => {
      const crm = Array.isArray(p.crm_client_profiles) ? p.crm_client_profiles[0] : p.crm_client_profiles;
      const scores = Array.isArray(p.crm_relationship_scores) ? p.crm_relationship_scores[0] : p.crm_relationship_scores;
      return {
        id: p.id,
        name: [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email,
        email: p.email,
        company: p.company_name || '',
        type: crm?.client_segmentation || 'prospect',
        stage: crm?.lifecycle_stage || 'lead',
        segment: crm?.client_segmentation || 'growth_opportunity',
        revenue: crm?.revenue_potential || 0,
        trust: scores?.trust_score || 50,
        risk: (scores?.churn_risk_score || 0) > 60 ? 'high' : (scores?.churn_risk_score || 0) > 30 ? 'medium' : 'low',
        relationshipStrength: scores?.relationship_strength || 50,
        trajectoryTrend: scores?.trajectory_trend || 'stable',
        paymentReliability: crm?.payment_reliability || 100,
        createdAt: p.created_at,
      };
    });

    return NextResponse.json({ success: true, clients, source: 'database' });
  } catch (error: any) {
    console.error('[API_CRM_CLIENTS_GET_ERROR]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST: Creates a new customer profile and CRM records in Supabase.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.email || !body.name) {
      return NextResponse.json({ success: false, error: 'name and email are required' }, { status: 400 });
    }

    const supabase = await createClient();
    const nameParts = (body.name as string).trim().split(' ');

    // Create base customer profile
    const { data: profile, error: profileError } = await supabase
      .from('customer_profiles')
      .insert({
        email: body.email,
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        company_name: body.company || '',
        relationship_notes: body.notes || '',
      })
      .select('id')
      .single();

    if (profileError) {
      // Handle duplicate email
      if (profileError.code === '23505') {
        return NextResponse.json({ success: false, error: 'A client with this email already exists' }, { status: 409 });
      }
      throw profileError;
    }

    // Create CRM profile with defaults
    await supabase.from('crm_client_profiles').insert({
      customer_id: profile.id,
      lifecycle_stage: body.lifecycleStage || 'lead',
      client_segmentation: body.segment || 'growth_opportunity',
      strategic_importance: body.importance || 'medium',
      revenue_potential: body.revenue || 0,
    });

    // Create relationship score baseline
    await supabase.from('crm_relationship_scores').insert({
      customer_id: profile.id,
    });

    console.info('[CRM_CLIENT_CREATED]', { profileId: profile.id, email: body.email });

    return NextResponse.json({
      success: true,
      message: 'Client relationship profile created successfully',
      id: profile.id,
    });
  } catch (error: any) {
    console.error('[API_CRM_CLIENTS_POST_ERROR]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
