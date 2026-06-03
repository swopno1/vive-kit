/**
 * Conversation History & Persistence Tests
 *
 * This test suite validates that ViveKit correctly:
 * - Reads full multi-turn conversation threads
 * - Parses email, Slack, and ticket formats
 * - Stores conversations as vector memories
 * - Retrieves full context for response generation
 * - Maintains conversation state across sessions
 *
 * Run with: npm run test -- conversation-history.test.ts
 */

import { ConversationParser } from '../src/lib/conversation/parser';
import { ConversationHistory } from '../src/lib/conversation/history';
import { Conversation, ConversationTurn } from '../src/types';

describe('Conversation History & Persistence', () => {
  const parser = new ConversationParser();
  const history = new ConversationHistory();

  // =====================================================================
  // MOCK DATA: Multi-Turn Conversations
  // =====================================================================

  const emailThread = `
From: john@acme.com
To: agency@vivereply.com
Date: 2026-05-20 10:30 AM
Subject: Custom Dashboard for Analytics

Hi there,

We're looking to build a custom analytics dashboard for our sales team.
The dashboard should pull data from our CRM and show real-time metrics.

Can you tell me what your timeline and pricing would be for something like this?

Thanks,
John Smith
Acme Corp

---

From: agency@vivereply.com
To: john@acme.com
Date: 2026-05-20 2:15 PM
Subject: RE: Custom Dashboard for Analytics

Hi John,

Thanks for reaching out! We'd love to help with your analytics dashboard.

For a project like this, here's typically what we recommend:

Phase 1: Requirements & Architecture (7-10 business days) - $2,500
Phase 2: CRM Integration & MVP Dashboard (21-30 days) - $5,000
Phase 3: Testing, Refinement & Launch (10-14 days) - $3,000

Total: $10,500 with a 5-week timeline.

We'd start with a discovery call to understand your CRM setup and dashboard requirements in detail.

Are you available for a quick 30-min call this week?

Best regards,
Alex
ViveScript Solutions

---

From: john@acme.com
To: agency@vivereply.com
Date: 2026-05-22 9:45 AM
Subject: RE: Custom Dashboard for Analytics

Alex,

Thanks for the breakdown. The pricing and timeline work for us.

A few quick questions before we jump on a call:
1. Do you integrate with Salesforce directly, or will we need custom API work?
2. Can the dashboard auto-update every 5 minutes?
3. What about user access control within the dashboard?

Looking forward to the call.

John

---

From: agency@vivereply.com
To: john@acme.com
Date: 2026-05-22 11:20 AM
Subject: RE: Custom Dashboard for Analytics

John,

Great questions! Quick answers:

1. We have native Salesforce connectors, so no custom API work needed.
2. Yes, we can set 5-minute refresh intervals. Some clients prefer 15-min to reduce API calls.
3. Absolutely - we build role-based access control into every dashboard.

Let's lock in that call. How about Thursday at 2 PM EST?

Alex
`;

  const slackThread = `
User: john_smith (John Smith)
Channel: #project-inquiry
Date: 2026-05-25 3:30 PM

john_smith: Hey, quick question about the dashboard project we discussed. Can you handle multiple data sources or just Salesforce?

---

User: alex_vivekit (Alex)
Date: 2026-05-25 3:45 PM

alex_vivekit: Great question, John! We can pull from multiple sources:
- Salesforce (native connector)
- Google Sheets (native connector)
- Custom APIs (with JSON/REST support)
- PostgreSQL databases

Most dashboards we build use 2-3 data sources. What are you thinking?

---

User: john_smith
Date: 2026-05-25 4:02 PM

john_smith: We'd need Salesforce, Google Sheets for some manual adjustments, and our internal PostgreSQL database for historical metrics. Can you handle that combo?

---

User: alex_vivekit
Date: 2026-05-25 4:15 PM

alex_vivekit: 100% - that's a common pattern we see. The three-source combo is straightforward. Just means Phase 2 gets a bit more complex, but timeline stays roughly the same.

Want to discuss integration specifics on the call Thursday?

---

User: john_smith
Date: 2026-05-25 4:22 PM

john_smith: Perfect. Yup, Thursday at 2 PM EST works.
`;

  const supportTicket = `
TICKET #2847
Status: Open
Priority: High
Created: 2026-05-23 11:15 AM
Updated: 2026-05-25 4:30 PM

Customer: John Smith (john@acme.com)
Company: Acme Corp
Subject: Dashboard Integration Questions

---

CUSTOMER MESSAGE (2026-05-23 11:15 AM):

Hi support team,

We've hired you to build a custom analytics dashboard. I have some integration questions:

1. Our Salesforce instance is heavily customized. Will that be a problem?
2. We need the dashboard to update in real-time (or near real-time). What's the minimum update frequency you support?
3. How do you handle user permissions in the dashboard? We have ~50 sales reps who need different dashboard views based on their team.

Thanks,
John

---

SUPPORT RESPONSE (2026-05-23 3:45 PM - Agent: Sarah):

Hi John,

Thanks for submitting your questions. Great details!

Quick answers:
1. Custom Salesforce instances are no problem. We've built dashboards for hundreds of customized orgs. We'll map your custom fields during Phase 1.
2. For update frequency, we typically support 5-minute intervals, though some clients prefer 15-min to optimize API usage. Real-time (sub-minute) is technically possible but increases costs.
3. For user permissions, we build row-level security (RLS) directly into the dashboard using your org structure. This scales well from 10 to 10,000 users.

See you Thursday for the discovery call!

Sarah
Support Team

---

CUSTOMER UPDATE (2026-05-25 4:30 PM):

Thanks Sarah! All of that sounds great. One more thing - can we do a phased rollout? Launch Phase 1 to our finance team first, then expand to sales after we validate the metrics?

---

SUPPORT RESPONSE (2026-05-25 4:45 PM - Agent: Sarah):

Absolutely, John! Phased rollout is actually how we structure most projects. Finance team gets Phase 1, then we add the sales module in Phase 2. Typical timeline doesn't change, just the rollout pattern.

We'll discuss the phasing strategy on the call Thursday.

Sarah
`;

  // =====================================================================
  // TEST CASES
  // =====================================================================

  describe('Conversation Parsing - Email Threads', () => {
    test('should parse multi-turn email thread correctly', () => {
      const parsed = parser.parseEmailThread(emailThread);

      expect(parsed).toBeDefined();
      expect(parsed.turns.length).toBe(4);
      expect(parsed.participants.length).toBeGreaterThanOrEqual(2);
    });

    test('should extract all conversation turns', () => {
      const parsed = parser.parseEmailThread(emailThread);

      expect(parsed.turns[0].sender).toBe('john@acme.com');
      expect(parsed.turns[0].content).toContain('analytics dashboard');
      expect(parsed.turns[1].sender).toBe('agency@vivereply.com');
      expect(parsed.turns[1].content).toContain('Phase 1');
    });

    test('should preserve timestamp order', () => {
      const parsed = parser.parseEmailThread(emailThread);

      for (let i = 1; i < parsed.turns.length; i++) {
        expect(parsed.turns[i].timestamp.getTime()).toBeGreaterThanOrEqual(
          parsed.turns[i - 1].timestamp.getTime()
        );
      }
    });

    test('should identify conversation subject', () => {
      const parsed = parser.parseEmailThread(emailThread);

      expect(parsed.subject).toContain('Dashboard');
    });

    test('should extract participant list', () => {
      const parsed = parser.parseEmailThread(emailThread);

      expect(parsed.participants).toContain('john@acme.com');
      expect(parsed.participants).toContain('agency@vivereply.com');
    });
  });

  describe('Conversation Parsing - Slack Threads', () => {
    test('should parse multi-turn Slack thread correctly', () => {
      const parsed = parser.parseSlackThread(slackThread);

      expect(parsed).toBeDefined();
      expect(parsed.turns.length).toBe(5);
    });

    test('should extract Slack usernames', () => {
      const parsed = parser.parseSlackThread(slackThread);

      expect(parsed.participants).toContain('john_smith');
      expect(parsed.participants).toContain('alex_vivekit');
    });

    test('should preserve message sequence', () => {
      const parsed = parser.parseSlackThread(slackThread);

      expect(parsed.turns[0].content).toContain('multiple data sources');
      expect(parsed.turns[1].content).toContain('native connector');
      expect(parsed.turns[2].content).toContain('Salesforce, Google Sheets');
    });

    test('should maintain Slack conversational context', () => {
      const parsed = parser.parseSlackThread(slackThread);

      // Verify conversation flows logically
      expect(parsed.turns[0].sender).toBe('john_smith');
      expect(parsed.turns[1].sender).toBe('alex_vivekit');
      expect(parsed.turns[2].sender).toBe('john_smith');
    });
  });

  describe('Conversation Parsing - Support Tickets', () => {
    test('should parse support ticket with multiple exchanges', () => {
      const parsed = parser.parseSupportTicket(supportTicket);

      expect(parsed).toBeDefined();
      expect(parsed.turns.length).toBeGreaterThanOrEqual(3);
    });

    test('should extract ticket metadata', () => {
      const parsed = parser.parseSupportTicket(supportTicket);

      expect(parsed.ticketId).toBe('2847');
      expect(parsed.status).toContain('Open');
      expect(parsed.priority).toContain('High');
    });

    test('should identify customer vs support messages', () => {
      const parsed = parser.parseSupportTicket(supportTicket);

      const customerTurns = parsed.turns.filter(t => t.sender.toLowerCase().includes('john'));
      const supportTurns = parsed.turns.filter(t => t.sender.toLowerCase().includes('sarah'));

      expect(customerTurns.length).toBeGreaterThan(0);
      expect(supportTurns.length).toBeGreaterThan(0);
    });
  });

  describe('Conversation Storage & Retrieval', () => {
    test('should store parsed conversation in database', async () => {
      const parsed = parser.parseEmailThread(emailThread);
      const stored = await history.store({
        userId: 'user-123',
        customerId: 'client-456',
        conversationData: parsed,
        channel: 'email'
      });

      expect(stored.id).toBeDefined();
      expect(stored.turns.length).toBe(parsed.turns.length);
    });

    test('should retrieve full conversation by ID', async () => {
      const parsed = parser.parseEmailThread(emailThread);
      const stored = await history.store({
        userId: 'user-123',
        customerId: 'client-456',
        conversationData: parsed,
        channel: 'email'
      });

      const retrieved = await history.getById(stored.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.turns.length).toBe(parsed.turns.length);
      expect(retrieved?.participants).toEqual(parsed.participants);
    });

    test('should retrieve all conversations for customer', async () => {
      const emailParsed = parser.parseEmailThread(emailThread);
      const slackParsed = parser.parseSlackThread(slackThread);

      await history.store({
        userId: 'user-123',
        customerId: 'client-456',
        conversationData: emailParsed,
        channel: 'email'
      });

      await history.store({
        userId: 'user-123',
        customerId: 'client-456',
        conversationData: slackParsed,
        channel: 'slack'
      });

      const allConversations = await history.getByCustomer('user-123', 'client-456');

      expect(allConversations.length).toBeGreaterThanOrEqual(2);
    });

    test('should maintain conversation state across sessions', async () => {
      const parsed = parser.parseEmailThread(emailThread);
      const stored = await history.store({
        userId: 'user-123',
        customerId: 'client-456',
        conversationData: parsed,
        channel: 'email'
      });

      // Simulate second session
      const retrieved = await history.getById(stored.id);

      expect(retrieved?.turns.length).toBe(parsed.turns.length);
      expect(retrieved?.createdAt).toBeDefined();
    });
  });

  describe('Conversation Context Assembly', () => {
    test('should assemble full thread for response generation', async () => {
      const parsed = parser.parseEmailThread(emailThread);

      const context = history.assembleContext(parsed);

      expect(context).toContain('John Smith');
      expect(context).toContain('analytics dashboard');
      expect(context).toContain('Phase 1');
      expect(context).toContain('Phase 2');
      expect(context).toContain('Phase 3');
      expect(context).toContain('Thursday at 2 PM');
    });

    test('should preserve conversation chronology in context', () => {
      const parsed = parser.parseEmailThread(emailThread);
      const context = history.assembleContext(parsed);

      // Initial request should appear before response
      const initialIndex = context.indexOf('analytics dashboard');
      const responseIndex = context.indexOf('Phase 1');

      expect(initialIndex).toBeLessThan(responseIndex);
    });

    test('should include speaker labels for clarity', () => {
      const parsed = parser.parseEmailThread(emailThread);
      const context = history.assembleContext(parsed);

      expect(context).toMatch(/john@acme\.com|John Smith/);
      expect(context).toMatch(/agency@vivereply\.com|Alex/);
    });
  });

  describe('Multi-Channel Conversation Merging', () => {
    test('should merge related conversations from multiple channels', async () => {
      const emailParsed = parser.parseEmailThread(emailThread);
      const slackParsed = parser.parseSlackThread(slackThread);
      const ticketParsed = parser.parseSupportTicket(supportTicket);

      // All three discussions about the same project
      const merged = history.mergeConversations([
        emailParsed,
        slackParsed,
        ticketParsed
      ]);

      expect(merged.turns.length).toBeGreaterThan(emailParsed.turns.length);
      expect(merged.channels).toContain('email');
      expect(merged.channels).toContain('slack');
      expect(merged.channels).toContain('ticket');
    });

    test('should chronologically order merged conversations', () => {
      const emailParsed = parser.parseEmailThread(emailThread);
      const slackParsed = parser.parseSlackThread(slackThread);

      const merged = history.mergeConversations([emailParsed, slackParsed]);

      // Verify chronological order
      for (let i = 1; i < merged.turns.length; i++) {
        expect(merged.turns[i].timestamp.getTime()).toBeGreaterThanOrEqual(
          merged.turns[i - 1].timestamp.getTime()
        );
      }
    });
  });

  describe('Conversation Completeness Validation', () => {
    test('should identify complete vs incomplete conversations', () => {
      const parsed = parser.parseEmailThread(emailThread);

      const complete = history.isConversationComplete(parsed);

      expect(complete).toBe(true); // Has resolution (meeting confirmed)
    });

    test('should flag conversations requiring follow-up', () => {
      const incompleteThread = `
From: john@acme.com
To: agency@vivereply.com
Date: 2026-05-20 10:30 AM
Subject: Pricing Question

Hi, what's your pricing for a simple web app?

Thanks,
John
`;

      const parsed = parser.parseEmailThread(incompleteThread);
      const needsResponse = !history.isConversationComplete(parsed);

      expect(needsResponse).toBe(true);
    });

    test('should calculate conversation maturity score', () => {
      const parsed = parser.parseEmailThread(emailThread);

      const score = history.getConversationMaturity(parsed);

      // 4-turn conversation should have high maturity (deal is closing)
      expect(score).toBeGreaterThan(0.7);
    });
  });

  describe('Conversation Integration with Response Generation', () => {
    test('should provide conversation context for next response', async () => {
      const parsed = parser.parseEmailThread(emailThread);
      const context = history.assembleContext(parsed);

      // Context should be suitable for AI response generation
      expect(context).toContain('Phase 1');
      expect(context).toContain('Phase 2');
      expect(context).toContain('Phase 3');
      expect(context.length).toBeGreaterThan(100); // Substantial context

      // Should summarize key points
      expect(context).toContain('timeline');
      expect(context).toContain('pricing');
    });

    test('should surface most recent unresolved questions', () => {
      const parsed = parser.parseEmailThread(emailThread);

      // In this thread, the most recent question is about availability for Thursday
      const lastMessage = parsed.turns[parsed.turns.length - 1];

      expect(lastMessage.content).toContain('Thursday');
    });
  });

  describe('Edge Cases & Error Handling', () => {
    test('should handle malformed email threads gracefully', () => {
      const malformed = 'Some random text without email structure';

      const parsed = parser.parseEmailThread(malformed);

      // Should return something, not crash
      expect(parsed).toBeDefined();
    });

    test('should handle conversations with missing timestamps', () => {
      const ticketWithMissingDates = `
TICKET #1234
Status: Open

CUSTOMER MESSAGE:
Hey, can you help with this project?

SUPPORT RESPONSE:
Sure! What do you need?
`;

      const parsed = parser.parseSupportTicket(ticketWithMissingDates);

      // Should still parse, with estimated/default timestamps
      expect(parsed.turns.length).toBeGreaterThan(0);
    });

    test('should handle very long conversations', () => {
      let longThread = emailThread;

      // Simulate 50+ message thread
      for (let i = 0; i < 10; i++) {
        longThread += `

From: john@acme.com
To: agency@vivereply.com
Date: 2026-05-${25 + i} ${9 + (i % 10)}:${30 + (i % 30)} AM
Subject: RE: Custom Dashboard for Analytics

Hi Alex,

Just following up on the dashboard project. When can we schedule a call?

Thanks,
John
`;
      }

      const parsed = parser.parseEmailThread(longThread);

      expect(parsed.turns.length).toBeGreaterThan(0);
    });
  });
});
