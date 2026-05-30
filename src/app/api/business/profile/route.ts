import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { BusinessIntelligenceEngine } from '../../../../lib/ai/business-engine';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: row } = await supabase
      .from('business_contexts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Return DB row if it exists, otherwise return the hardcoded ViveScript Solutions context
    const context = row ?? BusinessIntelligenceEngine.getFallbackContext();
    return NextResponse.json({ success: true, context, source: row ? 'database' : 'default' });
  } catch (error: any) {
    console.error('[API_BUSINESS_PROFILE_GET_ERROR]', error);
    return NextResponse.json({ success: true, context: BusinessIntelligenceEngine.getFallbackContext(), source: 'fallback' });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.businessName) {
      return NextResponse.json({ success: false, error: 'businessName is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check if a row already exists
    const { data: existing } = await supabase
      .from('business_contexts')
      .select('id')
      .limit(1)
      .maybeSingle();

    let result;
    if (existing?.id) {
      const { data, error } = await supabase
        .from('business_contexts')
        .update({
          business_name: body.businessName,
          industry: body.industry || null,
          website_url: body.websiteUrl || null,
          pricing_instructions: body.pricingInstructions || '',
          general_context: body.generalContext || '',
          tone_preference: body.tonePreference || 'professional',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('business_contexts')
        .insert({
          business_name: body.businessName,
          industry: body.industry || null,
          website_url: body.websiteUrl || null,
          pricing_instructions: body.pricingInstructions || '',
          general_context: body.generalContext || '',
          tone_preference: body.tonePreference || 'professional',
        })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    return NextResponse.json({ success: true, message: 'Business context updated', context: result });
  } catch (error: any) {
    console.error('[API_BUSINESS_PROFILE_POST_ERROR]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
