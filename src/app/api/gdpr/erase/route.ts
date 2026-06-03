import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * DELETE /api/gdpr/erase
 *
 * Permanently deletes authenticated user's data in compliance with GDPR erasure rights.
 * Deletes: vector_memories, crm_client_profiles, conversations, customer_profiles
 * Then signs out the user.
 *
 * Requires: Authenticated user
 *
 * @returns {Response} { success: boolean, message: string }
 * @throws 401 if not authenticated
 * @throws 500 on deletion error
 */
export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all vector memories
    await supabase
      .from('vector_memories')
      .delete()
      .eq('user_id', user.id);

    // Delete all CRM client profiles
    await supabase
      .from('crm_client_profiles')
      .delete()
      .eq('user_id', user.id);

    // Delete all relationship scores
    await supabase
      .from('crm_relationship_scores')
      .delete()
      .eq('user_id', user.id);

    // Delete all client interactions
    await supabase
      .from('crm_client_interactions')
      .delete()
      .eq('user_id', user.id);

    // Delete all conversations
    await supabase
      .from('conversations')
      .delete()
      .eq('user_id', user.id);

    // Delete suggested replies
    await supabase
      .from('suggested_replies')
      .delete()
      .eq('user_id', user.id);

    // Delete customer profile
    await supabase
      .from('customer_profiles')
      .delete()
      .eq('id', user.id);

    // Log GDPR erasure event for audit
    try {
      await supabase
        .from('crm_security_incidents')
        .insert([
          {
            user_id: user.id,
            incident_type: 'gdpr_erasure_request',
            description: 'User initiated account deletion and data erasure',
            severity: 'info',
            resolved: true,
          },
        ]);
    } catch (auditErr) {
      console.warn('Failed to log GDPR erasure event:', auditErr);
    }

    // Sign out the user
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: 'All your data has been permanently deleted. You have been signed out.',
    });
  } catch (err) {
    console.error('Failed to erase user data:', err);
    return NextResponse.json(
      { error: 'Failed to delete data. Please try again.' },
      { status: 500 }
    );
  }
}
