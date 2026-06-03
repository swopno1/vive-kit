import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/data/export
 *
 * Exports user's data (conversations, CRM profiles) as JSON file.
 * Requires: Authenticated user
 *
 * @returns {Response} JSON file with all user data
 * @throws 401 if not authenticated
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all user's conversations
    const { data: conversations } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id);

    // Fetch all user's vector memories
    const { data: embeddings } = await supabase
      .from('vector_memories')
      .select('id, user_id, content, relevance_weight, created_at')
      .eq('user_id', user.id);

    // Fetch all user's CRM client profiles
    const { data: clientProfiles } = await supabase
      .from('crm_client_profiles')
      .select('*')
      .eq('user_id', user.id);

    // Fetch customer profile
    const { data: customerProfile } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Compile export data
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
      },
      customerProfile: customerProfile || null,
      conversations: conversations || [],
      embeddings: embeddings || [],
      clientProfiles: clientProfiles || [],
      summary: {
        totalConversations: conversations?.length || 0,
        totalEmbeddings: embeddings?.length || 0,
        totalClientProfiles: clientProfiles?.length || 0,
      },
    };

    // Return as JSON file
    const jsonString = JSON.stringify(exportData, null, 2);
    return new NextResponse(jsonString, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="vivekit-data-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (err) {
    console.error('Failed to export user data:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
