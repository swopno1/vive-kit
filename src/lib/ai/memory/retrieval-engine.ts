import {
  RetrievalResult,
  ClientIntelligenceProfile
} from '../../../types';
import { embeddingService } from '../embedding-service';
import { createClient } from '../../supabase/server';
import { cacheService } from '../../cache-service';

export class RetrievalEngine {
  /**
   * Helper to get server-side supabase client.
   */
  private async getClient() {
    return await createClient();
  }

  /**
   * Performs semantic search across memories with metadata filtering and weighted ranking.
   */
  async retrieve(params: {
    query: string;
    customerId?: string;
    category?: string;
    limit?: number;
    threshold?: number;
  }): Promise<RetrievalResult[]> {
    const { query, customerId, category, limit = 5, threshold = 0.5 } = params;

    // 1. Generate query embedding
    const queryEmbedding = await embeddingService.generateEmbedding(query);

    // 2. Get server supabase client
    const supabase = await this.getClient();

    // 3. Call the enhanced matching function in Supabase
    const { data, error } = await supabase.rpc('match_memories_v2', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      p_customer_id: customerId,
      p_category: category
    });

    if (error) {
      console.error('Retrieval failed:', error);
      return [];
    }

    // 4. Mark memories as accessed for lifecycle management (safely caught to prevent query blocking)
    if (data && data.length > 0) {
      try {
        const ids = data.map((m: any) => m.id);
        const { error: accessError } = await supabase.rpc('mark_memory_accessed', { memory_ids: ids });
        if (accessError) {
          console.warn('Failed to mark memories as accessed:', accessError);
        }
      } catch (err) {
        console.warn('Error during memory access tracking:', err);
      }
    }

    return (data || []).map((m: any) => ({
      id: m.id,
      content: m.content,
      importanceScore: m.importance_score,
      category: m.category,
      similarity: m.similarity,
      weightedScore: m.weighted_score,
      metadata: m.metadata
    }));
  }

  /**
   * Retrieves the comprehensive intelligence profile for a client.
   */
  async getClientProfile(customerId: string): Promise<ClientIntelligenceProfile | null> {
    const cacheKey = `crm:profile:${customerId}`;
    try {
      const cached = await cacheService.get<ClientIntelligenceProfile>(cacheKey);
      if (cached) return cached;
    } catch (err) {
      console.warn('[CACHE] Read error for client profile:', err);
    }

    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('client_intelligence_profiles')
      .select('*')
      .eq('customer_id', customerId)
      .single();

    if (error || !data) return null;

    const profile: ClientIntelligenceProfile = {
      id: data.id,
      customerId: data.customer_id,
      trustScore: data.trust_score,
      communicationStyle: data.communication_style,
      pricingSensitivity: data.pricing_sensitivity,
      relationshipStrength: data.relationship_strength,
      responsivenessPattern: data.responsiveness_pattern,
      negotiationStyle: data.negotiation_style,
      paymentBehavior: data.payment_behavior,
      projectHistorySummary: data.project_history_summary,
      intelligenceData: data.intelligence_data,
      lastUpdatedAt: data.last_updated_at,
      createdAt: data.created_at
    };

    try {
      await cacheService.set(cacheKey, profile, 600); // 10 minutes cache
    } catch (err) {
      console.warn('[CACHE] Write error for client profile:', err);
    }

    return profile;
  }
}

export const retrievalEngine = new RetrievalEngine();
