# Conversation History & Multi-Turn Thread Management

## Overview

ViveKit reads full multi-turn conversation threads from email, Slack, tickets, and other channels. These conversations are parsed, stored as vector memories, and surfaced to the AI for context-aware response generation.

## Supported Conversation Formats

### 1. **Email Threads**

ViveKit parses standard email thread formats with:
- Multiple turns (in-reply-to chains)
- Sender/recipient metadata
- Timestamps for each message
- Subject preservation

**Example:**
```
From: john@acme.com
To: agency@vivereply.com
Date: 2026-05-20 10:30 AM
Subject: Custom Dashboard for Analytics

Hi there,

We're looking to build a custom analytics dashboard...
```

### 2. **Slack Threads**

Parses Slack channel threads with:
- Sequential messages from users
- User mentions (@username)
- Timestamps (thread awareness)
- Multi-turn conversation flow

**Example:**
```
john_smith: Hey, quick question about the dashboard project...

alex_vivekit: Great question! We can pull from multiple sources:
- Salesforce
- Google Sheets
- Custom APIs
```

### 3. **Support Tickets**

Parses ticketing systems with:
- Ticket ID and metadata (status, priority)
- Customer message → Support response pattern
- Multiple back-and-forth exchanges
- Agent assignment tracking

**Example:**
```
TICKET #2847
Status: Open
Priority: High

CUSTOMER MESSAGE (2026-05-23):
We've hired you to build a dashboard. Questions about integration...

SUPPORT RESPONSE (2026-05-23 - Agent: Sarah):
Hi John, great questions!
```

### 4. **Other Formats**

ViveKit also handles:
- SMS/text message threads
- In-app chat histories
- Forum discussions
- Raw conversation dumps

## How Conversation Parsing Works

### Step 1: Upload/Paste Conversation

User pastes raw conversation in the workspace:

```
User Interface:
┌────────────────────────────────┐
│ Paste Conversation             │
│                                │
│ [Large text area]              │
│ [Select Format: Email/Slack/...] 
│ [Parse Conversation]           │
└────────────────────────────────┘
```

### Step 2: Automatic Detection

If format not specified, ViveKit detects:

```typescript
const conversation = parser.detectAndParse(rawText);
// Returns: { turns, format, participants, subject, ... }
```

### Step 3: Turn Extraction

Conversation broken into individual turns:

```json
[
  {
    "sender": "john@acme.com",
    "timestamp": "2026-05-20T10:30:00Z",
    "content": "We're looking to build a custom dashboard...",
    "role": "customer"
  },
  {
    "sender": "alex@agency.com",
    "timestamp": "2026-05-20T14:15:00Z",
    "content": "Thanks for reaching out! Here's our proposal...",
    "role": "service_provider"
  }
]
```

### Step 4: Vector Storage

Each turn stored as a memory:

```typescript
await memoryManager.storeMemory({
  userId: user.id,
  customerId: client.id,
  content: turn.content,
  category: 'conversation',
  metadata: {
    turn_order: index,
    sender: turn.sender,
    channel: 'email'
  }
});
```

### Step 5: Context Assembly

When response generated, full thread assembled:

```
CLIENT CONVERSATION HISTORY (Most Recent First):

Date: 2026-05-22 11:20 AM
Alex: John, great questions! Quick answers:
1. We have native Salesforce connectors, so no custom API work needed.
2. Yes, we can set 5-minute refresh intervals...

Date: 2026-05-22 09:45 AM
John: Alex, thanks for the breakdown. The pricing and timeline work for us.
A few quick questions before we jump on a call:
1. Do you integrate with Salesforce directly...

Date: 2026-05-20 14:15
Alex: Thanks for reaching out! We'd love to help...
For a project like this, here's typically what we recommend...

Date: 2026-05-20 10:30 AM
John: Hi there, we're looking to build a custom analytics dashboard...
```

## Integration with Response Generation

### Auto-Context Injection

When `/api/ai/generate` is called:

```typescript
export async function POST(req: Request) {
  const { conversationId, newMessage, customerId } = await req.json();

  // 1. Retrieve full conversation
  const conversation = await history.getById(conversationId);

  // 2. Assemble context
  const threadContext = history.assembleContext(conversation);

  // 3. Inject into prompt
  const prompt = `
${threadContext}

Customer's new message: "${newMessage}"

Generate a response considering the full conversation history above.
  `;

  // 4. Generate response
  const response = await aiService.generate(prompt);
  
  return NextResponse.json({ reply: response });
}
```

### Multi-Channel Merging

If client has conversations across email + Slack + tickets:

```typescript
const merged = history.mergeConversations([
  emailConversation,    // 4 turns
  slackThread,          // 5 turns
  supportTicket         // 3 turns
]);

// Result: 12 turns, chronologically ordered, single unified context
```

## Test Coverage

Comprehensive test suite (`tests/conversation-history.test.ts`) validates:

- ✅ Email thread parsing with multiple turns
- ✅ Slack thread extraction with usernames
- ✅ Support ticket parsing (customer + support)
- ✅ Multi-channel conversation merging
- ✅ Timestamp preservation and ordering
- ✅ Participant identification
- ✅ Storage and retrieval persistence
- ✅ Long conversation handling (50+ messages)
- ✅ Malformed input graceful degradation

**Run tests:**
```bash
npm run test -- conversation-history.test.ts
```

## Example: Full Conversation Lifecycle

### Input: Raw Email Thread (4 turns)

```
From: john@acme.com
To: agency@vivereply.com
Date: 2026-05-20 10:30 AM
Subject: Custom Dashboard for Analytics

Hi there, we're looking to build a custom analytics dashboard...

---

From: agency@vivereply.com
To: john@acme.com
Date: 2026-05-20 2:15 PM

Hi John, thanks for reaching out! We'd love to help...
Phase 1: $2,500
Phase 2: $5,000
Phase 3: $3,000

Are you available for a call this week?

---

From: john@acme.com
To: agency@vivereply.com
Date: 2026-05-22 9:45 AM

Alex, thanks for the breakdown. The pricing works.

A few quick questions:
1. Do you integrate with Salesforce?
2. Can the dashboard auto-update every 5 minutes?
3. What about user access control?

---

From: agency@vivereply.com
To: john@acme.com
Date: 2026-05-22 11:20 AM

John,

Great questions!
1. Yes, native Salesforce connectors, no custom API work.
2. Yes, 5-minute intervals (some prefer 15-min).
3. Absolutely - role-based access control included.

How about Thursday at 2 PM EST for the call?
```

### Processing Steps

1. **Parse**: Extract 4 turns, identify participants, preserve timestamps
2. **Store**: Each turn indexed in pgvector, tagged with 'conversation' category
3. **Link**: Associate conversation with customer CRM profile
4. **Assemble**: Create unified context for response generation

### Output: Unified Context

```
CLIENT CONVERSATION HISTORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Participants: john@acme.com (customer), agency@vivereply.com (provider)
Channel: Email
Started: 2026-05-20 10:30 AM
Status: Active (awaiting Thursday call confirmation)

CONVERSATION FLOW:
━━━━━━━━━━━━━━━━━━

[Turn 1] john@acme.com - 2026-05-20 10:30 AM
"Hi there, we're looking to build a custom analytics dashboard for our sales team.
The dashboard should pull data from our CRM and show real-time metrics.
Can you tell me what your timeline and pricing would be?"

[Turn 2] agency@vivereply.com - 2026-05-20 2:15 PM
"Thanks for reaching out! We'd love to help with your analytics dashboard.
Phase 1: Requirements & Architecture (7-10 days) - $2,500
Phase 2: CRM Integration & MVP (21-30 days) - $5,000
Phase 3: Testing & Launch (10-14 days) - $3,000
Total: $10,500 with 5-week timeline.
Are you available for a call this week?"

[Turn 3] john@acme.com - 2026-05-22 9:45 AM
"Thanks for the breakdown. The pricing and timeline work for us.
Questions:
1. Salesforce integration - direct or custom API?
2. Auto-update frequency?
3. User access control within dashboard?"

[Turn 4] agency@vivereply.com - 2026-05-22 11:20 AM
"Great questions!
1. Native Salesforce connectors, no custom API work.
2. Can set 5-minute intervals (15-min also available).
3. Role-based access control built in.
How about Thursday at 2 PM EST for the call?"

KEY POINTS:
━━━━━━━━━━━━
- Project: Custom analytics dashboard
- Services: Salesforce + Google Sheets + PostgreSQL integration
- Pricing: $10,500 (3 phases)
- Timeline: 5 weeks
- Next Step: Discovery call Thursday 2 PM EST
- Status: High interest, questions answered, ready to move forward
```

### Response Generation

When next client message arrives, AI has full context:

```
If client says: "Thursday 2 PM EST works perfectly. Can we do a phased rollout?"

AI knows:
✅ Previous pricing and timeline discussed
✅ Salesforce + Google Sheets + PostgreSQL integration scope
✅ User access control requirements
✅ Budget ($10,500) is acceptable to them
✅ They want phased rollout by team

Response can be: "Perfect! Let's do a phased approach - Phase 1 for your finance team first, 
then we add sales in Phase 2. This doesn't change the timeline, just the rollout pattern. 
See you Thursday at 2 PM EST!"
```

## Performance & Optimization

- **Parsing**: <500ms for typical email thread
- **Storage**: Sub-100ms (pgvector HNSW indexing)
- **Retrieval**: <50ms to assemble full context
- **Memory Efficiency**: Conversation compressed by thread, not stored verbatim

## Best Practices

1. **Complete Threads**
   - Paste full email chains, not individual messages
   - Include all participants for context
   - Preserve timestamps for accuracy

2. **Channel Mixing**
   - It's fine to have email + Slack + tickets for same customer
   - ViveKit automatically merges chronologically
   - No need to manually concatenate

3. **Privacy**
   - Conversations are encrypted in storage
   - Only accessible to account owner
   - RLS policies enforce customer isolation

4. **Conversation Freshness**
   - Re-paste new turns as conversation progresses
   - Or use `/api/conversations/append` to add single new messages
   - Ensures latest context available for response generation

## API Endpoints

```
POST /api/conversations/parse
- Input: { rawConversation, format: 'email'|'slack'|'ticket'|'auto' }
- Output: { conversationId, turns, participants, subject, ... }

GET /api/conversations/{id}
- Output: Full conversation with all turns

GET /api/conversations/customer/{customerId}
- Output: All conversations for a customer

POST /api/conversations/{id}/append
- Input: { newMessage, sender, timestamp }
- Output: Updated conversation

POST /api/ai/generate
- Input: { conversationId, newMessage, customerId }
- Output: { reply, context_used, ... }
```

---

Last Updated: 2026-06-03
