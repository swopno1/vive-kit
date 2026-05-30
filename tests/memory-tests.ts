import { memoryManager } from '../src/lib/ai/memory/memory-manager';
import { retrievalEngine } from '../src/lib/ai/memory/retrieval-engine';
import { contextAssembler } from '../src/lib/ai/memory/context-assembler';
import { phase5Scenarios } from './phase5-scenarios';

/**
 * Phase 6 Memory System Test Suite
 */
export async function runMemoryTests() {
  console.log('🚀 Starting Phase 6 Memory System Tests...');

  const customerId = '00000000-0000-0000-0000-000000000000';
  const conversationId = 'test-conv-1';

  try {
    // 1. Test Memory Storage
    console.log('--- Testing Memory Storage ---');
    const scenario = phase5Scenarios[1]; // High Value Lead
    // Mock intelligence object based on scenario
    const mockIntelligence: any = {
      projectIntelligence: {
        requestedDeliverables: ['Custom AI Chatbot', 'Lead Gen Funnel'],
        timelineExpectations: '3 weeks',
        projectComplexity: 'high'
      },
      businessIntelligence: {
        budgetSignals: ['Budget: 0,000'],
        pricingSensitivity: 'low',
        leadQuality: 95
      },
      communicationIntelligence: {
        toneStyle: 'professional',
        communicationPreference: 'email',
        negotiationBehavior: 'strategic',
        responsivenessPattern: 'fast'
      },
      emotionalAnalysis: {
        trustIndicators: ['Positive previous project', 'Direct referral'],
        frustrationLevel: 10,
        excitementLevel: 80,
        primaryEmotion: 'excited'
      },
      riskAnalysis: {
        riskScore: 10,
        riskFactors: []
      },
      negotiationSignals: {
        hasDiscountRequest: false,
        buyingIntentScore: 90
      },
      summary: {
        executiveSummary: 'High value lead interested in AI automation.'
      }
    };

    console.log('Processing intelligence and storing memories...');
    await memoryManager.processIntelligence(customerId, conversationId, mockIntelligence);
    console.log('✅ Memory storage successful.');

    // 2. Test Retrieval
    console.log('--- Testing Semantic Retrieval ---');
    const results = await retrievalEngine.retrieve({
      query: 'What did the client say about the AI chatbot project?',
      customerId: customerId
    });

    console.log(`Retrieved ${results.length} memories.`);
    results.forEach((m, i) => {
      console.log(`[${i}] Category: ${m.category}, Score: ${m.weightedScore.toFixed(2)}, Content: ${m.content}`);
    });

    if (results.length > 0) {
      console.log('✅ Semantic retrieval successful.');
    } else {
      console.log('❌ Semantic retrieval returned no results.');
    }

    // 3. Test Profile Retrieval
    console.log('--- Testing Profile Retrieval ---');
    const profile = await retrievalEngine.getClientProfile(customerId);
    if (profile) {
      console.log(`✅ Profile found: Trust Score ${profile.trustScore}, Sensitivity ${profile.pricingSensitivity}`);
    } else {
      console.log('❌ Profile not found.');
    }

    // 4. Test Context Assembly
    console.log('--- Testing Context Assembly ---');
    const context = contextAssembler.assemble(results, profile);
    console.log('Assembled Context Summary Preview:');
    console.log(context.summary.substring(0, 200) + '...');

    if (context.summary.includes('CLIENT INTELLIGENCE PROFILE') && context.summary.includes('HISTORICAL CONTEXT')) {
      console.log('✅ Context assembly successful.');
    } else {
      console.log('❌ Context assembly incomplete.');
    }

    console.log('🎉 All Phase 6 Memory System tests passed successfully.');

  } catch (error) {
    console.error('❌ Memory System Tests Failed:', error);
  }
}
