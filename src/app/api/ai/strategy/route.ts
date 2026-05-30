import { NextResponse } from 'next/server';
import { StrategyEngine } from '../../../../lib/ai/strategy-engine';
import { createClient } from '../../../../lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { rawConversation, businessPriority, customerId } = await req.json();

    if (!rawConversation) {
      return NextResponse.json({ success: false, error: 'rawConversation is required' }, { status: 400 });
    }

    let clientContext = null;

    if (customerId && customerId !== '00000000-0000-0000-0000-000000000000') {
      try {
        const supabase = await createClient();
        const { data } = await supabase
          .from('customer_profiles')
          .select('*, crm_client_profiles (*), crm_client_behaviors (*), crm_relationship_scores (*)')
          .eq('id', customerId)
          .maybeSingle();

        if (data) {
          clientContext = {
            profile: Array.isArray(data.crm_client_profiles) ? data.crm_client_profiles[0] : data.crm_client_profiles,
            behavior: Array.isArray(data.crm_client_behaviors) ? data.crm_client_behaviors[0] : data.crm_client_behaviors,
            scores: Array.isArray(data.crm_relationship_scores) ? data.crm_relationship_scores[0] : data.crm_relationship_scores,
          };
        }
      } catch {
        // Non-blocking — proceed without CRM context
      }
    }

    const payload = StrategyEngine.generateMultiReplies(
      rawConversation,
      businessPriority || 'profitability',
      clientContext
    );

    return NextResponse.json({ success: true, data: payload, timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.error('[API_AI_STRATEGY_POST_ERROR]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
