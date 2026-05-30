import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';

/**
 * GET: Returns the authenticated user's customer profile.
 * Creates one on first visit (CRM onboarding flow).
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Look up existing customer profile by email
    const { data: existing } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('email', user.email!)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true, profile: existing });
    }

    // First visit — create a customer profile from the OAuth identity
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const { data: created, error: insertError } = await supabase
      .from('customer_profiles')
      .insert({
        email: user.email!,
        first_name: firstName,
        last_name: lastName,
        company_name: user.user_metadata?.company || '',
        relationship_notes: 'Auto-created via Google OAuth onboarding.',
      })
      .select()
      .single();

    if (insertError) {
      console.error('[CRM_ME_INSERT_ERROR]', insertError);
      return NextResponse.json({ success: false, error: 'Failed to create profile' }, { status: 500 });
    }

    console.info('[CRM_ME_ONBOARDED]', { email: user.email, profileId: created.id });
    return NextResponse.json({ success: true, profile: created, created: true });

  } catch (error: any) {
    console.error('[CRM_ME_ERROR]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
