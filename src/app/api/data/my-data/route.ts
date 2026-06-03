import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/data/my-data
 *
 * Returns user's data summary (conversations, embeddings, client profiles, storage usage).
 * Requires: Authenticated user
 *
 * @returns {Response} {
 *   conversationCount: number,
 *   embeddingsCount: number,
 *   clientProfileCount: number,
 *   storageUsedBytes: number,
 *   conversationStorageBytes: number,
 *   embeddingsStorageBytes: number,
 *   crmStorageBytes: number
 * }
 * @throws 401 if not authenticated
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Count conversations
    const { count: conversationCount } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Count embeddings/vector memories
    const { count: embeddingsCount } = await supabase
      .from('vector_memories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Count client profiles in CRM
    const { count: clientProfileCount } = await supabase
      .from('crm_client_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Estimate storage (in bytes)
    // Rough estimates: conversation ~5KB, embedding ~2KB, client profile ~3KB
    const conversationStorageBytes = (conversationCount || 0) * 5120;
    const embeddingsStorageBytes = (embeddingsCount || 0) * 2048;
    const crmStorageBytes = (clientProfileCount || 0) * 3072;
    const totalStorageBytes = conversationStorageBytes + embeddingsStorageBytes + crmStorageBytes;

    return NextResponse.json({
      conversationCount: conversationCount || 0,
      embeddingsCount: embeddingsCount || 0,
      clientProfileCount: clientProfileCount || 0,
      storageUsedBytes: totalStorageBytes,
      conversationStorageBytes,
      embeddingsStorageBytes,
      crmStorageBytes,
    });
  } catch (err) {
    console.error('Failed to fetch user data:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
