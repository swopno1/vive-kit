# CRM Context Integration

## Overview

ViveKit automatically surfaces client relationship data and conversation history into AI-generated responses. This ensures that the AI understands the client's context and adapts tone, pricing strategy, and communication style accordingly.

## What Gets Integrated

### 1. **Client Intelligence Profile**

When a client is identified in the CRM, the following data is injected into the response generation context:

```json
{
  "name": "Acme Corp",
  "communicationStyle": "Direct and professional",
  "pricingSensitivity": "Medium - values quality but budget-conscious",
  "relationshipStrength": 85,
  "trustScore": 90,
  "negotiationStyle": "Collaborative",
  "projectHistorySummary": "3 successful projects over 18 months, $45k total ACV",
  "lastInteractionDate": "2026-05-28",
  "nextFollowUpDate": "2026-06-10"
}
```

### 2. **Conversation History**

All relevant past interactions are retrieved and surface as context:

```
CONVERSATION HISTORY:
- First meeting: Discussed web app MVP and timeline (Relevance: 80%)
- Follow-up: Reviewed project scope and confirmed budget (Relevance: 85%)
- Last week: Delivered Phase 1 MVP, client very satisfied (Relevance: 92%)
```

### 3. **Memory Categories**

Extracted memories are organized by type:

- **Communication Preferences**: How client prefers to be contacted
- **Project History**: Past successful deliverables
- **Pricing Profile**: Budget constraints and value perception
- **Service Interest**: What the client previously requested
- **Interaction Patterns**: Negotiation style, objection handling

## How It Works

### 1. **Retrieval Pipeline**

When a response is generated:

```
User Input + Client ID → Retrieve CRM Profile
                       ↓
                  Retrieve Related Memories (pgvector RAG)
                       ↓
                  Assemble Context (ContextAssembler)
                       ↓
                  Inject into AI Prompt
                       ↓
                  Generate Personalized Response
```

### 2. **Memory Optimization**

To prevent context bloat:
- Memories ranked by relevance score (0.0 - 1.0)
- Token budget enforced (default: 1,000 tokens max)
- Highest-relevance memories included first
- Older, less-relevant memories dropped if over budget

### 3. **Tone Adaptation**

The AI adjusts response tone based on relationship data:

| Metric | Impact |
|--------|--------|
| **Relationship Strength** | Determines formality level (95 = warm, 30 = formal) |
| **Trust Score** | Influences risk-taking in promises/commitments (90+ = confident, <60 = cautious) |
| **Pricing Sensitivity** | Shapes pricing language (high = emphasize ROI, low = highlight premium features) |
| **Communication Style** | Matches client's preferred voice (direct = concise, collaborative = detailed) |
| **Negotiation Style** | Determines approach to objections |

## Example: How Context Changes Response

### Scenario: Pricing Question from Two Different Clients

**Client A: New prospect, low trust (Trust: 40), cost-sensitive**

```
📊 Context:
- First-time client, no previous projects
- Very high - cost is primary decision driver
- Low trust score

✍️ AI Response:
"Thank you for your inquiry. Our standard packages start at $4,900 
for MVP development. We focus on delivering maximum ROI with 
milestone-based pricing, so you only pay as you see progress. 
I'd recommend a brief discovery call to explore cost-effective options 
aligned with your budget."
```

**Client B: Established partner, high trust (Trust: 90), repeating client**

```
📊 Context:
- 3 successful projects, $45k ACV, consistent repeat business
- Medium - values quality but budget-conscious
- High trust and relationship strength

✍️ AI Response:
"Great to hear from you! Based on our track record together, I'm 
confident we can structure Phase 2 at $5,500 with the premium 
features you requested. Given your success with the previous MVP, 
we'll fast-track the discovery and have a proposal to you by Friday."
```

## Integration Points

### In Response Generation API

```typescript
// Retrieve client profile if customerId provided
const profile = await crm.getClientProfile(customerId);

// Retrieve relevant memories via RAG
const memories = await memoryManager.retrieveMemories(
  customerId,
  rawConversation,
  { limit: 10 }
);

// Assemble context
const context = contextAssembler.assemble(memories, profile);

// Inject into AI prompt
const prompt = `
${context.summary}

Now generate a personalized response...
`;

const response = await aiService.generate({ prompt, ...config });
```

### In Memory Storage

After approval, interaction is stored for future retrieval:

```typescript
// Store as vector memory for RAG
await memoryManager.storeMemory({
  userId: user.id,
  customerId: client.id,
  content: "Client requested custom dashboard feature",
  category: 'service_interest',
  tags: ['dashboard', 'custom_feature']
});

// Update relationship metrics
await crm.updateRelationshipMetrics(client.id, {
  lastInteractionDate: new Date(),
  successIndicator: 'approved_and_sent'
});
```

## Test Coverage

Comprehensive test suite (`tests/crm-context.test.ts`) validates:

- ✅ Context assembly from profiles and memories
- ✅ Memory categorization and organization
- ✅ Token budget optimization
- ✅ Multi-conversation context prioritization
- ✅ Relationship strength impact on tone
- ✅ Trust score influence on response confidence
- ✅ Pricing sensitivity adaptation
- ✅ Communication style matching

**Run tests:**
```bash
npm run test -- crm-context.test.ts
```

## Edge Cases Handled

1. **New Client (No CRM Data)**
   - Uses generic professional tone
   - Shows service catalog
   - Focuses on discovery process

2. **Existing Client (Incomplete Profile)**
   - Uses available data
   - Gracefully skips missing sections
   - Relies on conversation history

3. **Large Memory Pool**
   - Sorts by relevance score
   - Enforces token budget
   - Includes 3-5 most relevant interactions

4. **Context Relevance Mismatch**
   - Only surfaces memories with 70%+ relevance score
   - Recent interactions weighted higher than old ones
   - Category-specific memories prioritized

## Customization

To adjust how context influences responses:

1. **Modify Memory Categories** - `memory-manager.ts`
   - Add new categories (e.g., 'budget_history')
   - Adjust relevance weighting

2. **Adjust Token Budget** - `context-assembler.ts`
   - Change `maxTokens` parameter (default: 1000)
   - Different budgets for different tone types

3. **Add Relationship Metrics** - `crm.types.ts`
   - New fields (e.g., 'communication_frequency_score')
   - Adjust how they influence response tone

## Performance Notes

- Memory retrieval: Sub-100ms (pgvector HNSW index)
- Context assembly: <50ms (token estimation + formatting)
- Total overhead: <150ms per response
- No impact on response generation latency

## Best Practices

1. **Maintain Accurate Profiles**
   - Update relationship strength quarterly
   - Track budget/pricing sensitivity changes
   - Log key interactions

2. **Regular Memory Pruning**
   - Archive old, low-relevance memories annually
   - Keep 5-10 most relevant interactions per client
   - Maintain clear category assignments

3. **Monitor Tone Appropriateness**
   - Review responses for high-relationship clients (ensure warmth)
   - Review responses for new clients (ensure formality)
   - Adjust communication style if client feedback indicates mismatch

---

Last Updated: 2026-06-03
