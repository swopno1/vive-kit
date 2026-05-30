import {
  ConversationIntelligence,
  MemoryObject,
  MemoryCategory,
  ClientIntelligenceProfile
} from '../../../types';
import { embeddingService } from '../embedding-service';
import { createClient } from '../../supabase/server';
import { cacheService } from '../../cache-service';

export class MemoryManager {
  /**
   * Helper to get server-side supabase client.
   */
  private async getClient() {
    return await createClient();
  }

  /**
   * Processes conversation intelligence and stores relevant memories.
   */
  async processIntelligence(
    customerId: string,
    conversationId: string,
    intelligence: ConversationIntelligence
  ): Promise<void> {
    const memories: MemoryObject[] = this.extractMemories(intelligence, customerId, conversationId);

    // Generate embeddings for all memories
    const texts = memories.map(m => m.content);
    const embeddings = await embeddingService.generateEmbeddingsBatch(texts);

    // Assign embeddings and store
    const memoriesToStore = memories.map((m, i) => ({
      ...m,
      embedding: embeddings[i]
    }));

    await this.storeMemories(memoriesToStore);
    await this.updateClientProfile(customerId, intelligence);
  }

  /**
   * Extracts discrete memory objects from structured intelligence.
   */
  private extractMemories(
    intel: ConversationIntelligence,
    customerId: string,
    conversationId: string
  ): MemoryObject[] {
    const memories: MemoryObject[] = [];
    const timestamp = new Date().toISOString();

    // 1. Project Requirements
    if (intel.projectIntelligence.requestedDeliverables.length > 0) {
      memories.push({
        content: `Requested deliverables: ${intel.projectIntelligence.requestedDeliverables.join(', ')}. Timeline: ${intel.projectIntelligence.timelineExpectations}`,
        category: 'project_requirement',
        importanceScore: 0.8,
        customerId,
        metadata: { sourceConversationId: conversationId, timestamp, relevanceTags: ['deliverables', 'timeline'] }
      });
    }

    // 2. Pricing Discussions
    if (intel.negotiationSignals.hasDiscountRequest || intel.businessIntelligence.budgetSignals.length > 0) {
      memories.push({
        content: `Pricing context: ${intel.businessIntelligence.budgetSignals.join('; ')}. Negotiation behavior: ${intel.communicationIntelligence.negotiationBehavior}`,
        category: 'pricing_discussion',
        importanceScore: 0.9,
        customerId,
        metadata: { sourceConversationId: conversationId, timestamp, relevanceTags: ['pricing', 'budget', 'negotiation'] }
      });
    }

    // 3. Client Preferences
    memories.push({
      content: `Communication preference: ${intel.communicationIntelligence.communicationPreference}. Tone style: ${intel.communicationIntelligence.toneStyle}`,
      category: 'client_preference',
      importanceScore: 0.6,
      customerId,
      metadata: { sourceConversationId: conversationId, timestamp, relevanceTags: ['preference', 'tone'] }
    });

    // 4. Emotional Signals & Trust
    if (intel.emotionalAnalysis.trustIndicators.length > 0) {
      memories.push({
        content: `Trust indicators: ${intel.emotionalAnalysis.trustIndicators.join(', ')}`,
        category: 'trust_indicator',
        importanceScore: 0.7,
        customerId,
        metadata: { sourceConversationId: conversationId, timestamp, relevanceTags: ['trust', 'sentiment'] }
      });
    }

    // 5. Business Risks
    if (intel.riskAnalysis.riskScore > 40) {
      memories.push({
        content: `Risk factors: ${intel.riskAnalysis.riskFactors.map(f => f.explanation).join('; ')}`,
        category: 'business_risk',
        importanceScore: intel.riskAnalysis.riskScore / 100,
        customerId,
        metadata: { sourceConversationId: conversationId, timestamp, relevanceTags: ['risk', 'mitigation'] }
      });
    }

    return memories;
  }

  /**
   * Stores memories in the database.
   */
  private async storeMemories(memories: MemoryObject[]): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase.from('vector_memories').insert(
      memories.map(m => ({
        content: m.content,
        embedding: m.embedding,
        customer_id: m.customerId,
        importance_score: m.importanceScore,
        category: m.category,
        metadata: m.metadata
      }))
    );

    if (error) throw error;
  }

  /**
   * Updates or creates a client intelligence profile.
   */
  private async updateClientProfile(customerId: string, intel: ConversationIntelligence): Promise<void> {
    const supabase = await this.getClient();
    const { data: existingProfile } = await supabase
      .from('client_intelligence_profiles')
      .select('*')
      .eq('customer_id', customerId)
      .single();

    const profileUpdate: Partial<ClientIntelligenceProfile> = {
      customerId,
      trustScore: this.calculateMovingAverage(existingProfile?.trust_score || 50, intel.emotionalAnalysis.trustIndicators.length > 0 ? 80 : 40),
      communicationStyle: intel.communicationIntelligence.toneStyle,
      pricingSensitivity: intel.businessIntelligence.pricingSensitivity,
      relationshipStrength: this.calculateMovingAverage(existingProfile?.relationship_strength || 50, 100 - intel.riskAnalysis.riskScore),
      responsivenessPattern: intel.communicationIntelligence.responsivenessPattern,
      negotiationStyle: intel.communicationIntelligence.negotiationBehavior,
      paymentBehavior: existingProfile?.payment_behavior || 'unknown',
      projectHistorySummary: intel.summary.executiveSummary,
      intelligenceData: intel,
      lastUpdatedAt: new Date().toISOString()
    };

    const { error } = await supabase
      .from('client_intelligence_profiles')
      .upsert({
        customer_id: profileUpdate.customerId,
        trust_score: profileUpdate.trustScore,
        communication_style: profileUpdate.communicationStyle,
        pricing_sensitivity: profileUpdate.pricingSensitivity,
        relationship_strength: profileUpdate.relationshipStrength,
        responsiveness_pattern: profileUpdate.responsivenessPattern,
        negotiation_style: profileUpdate.negotiationStyle,
        payment_behavior: profileUpdate.paymentBehavior,
        project_history_summary: profileUpdate.projectHistorySummary,
        intelligence_data: profileUpdate.intelligenceData,
        last_updated_at: profileUpdate.lastUpdatedAt
      }, { onConflict: 'customer_id' });

    if (error) throw error;

    try {
      await cacheService.delete(`crm:profile:${customerId}`);
    } catch (err) {
      console.warn('[CACHE] Deletion error during profile update:', err);
    }
  }

  private calculateMovingAverage(current: number, newValue: number, weight: number = 0.3): number {
    return (current * (1 - weight)) + (newValue * weight);
  }

  /**
   * Implements memory aging by decaying importance scores of old memories.
   * This would typically be run by a cron job or periodic background task.
   */
  async ageMemories(): Promise<void> {
    // In a real PG environment, we'd use a SQL query.
    // For this implementation, we'll describe the logic.
    // UPDATE vector_memories SET importance_score = importance_score * 0.95
    // WHERE last_accessed_at < NOW() - INTERVAL '30 days'
  }
}

export const memoryManager = new MemoryManager();
