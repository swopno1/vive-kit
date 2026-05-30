export const phase5Scenarios = [
  {
    id: 'angry-client-scope-creep',
    name: 'Angry Client / Scope Creep',
    description: 'A client who is frustrated and demanding work outside of the original agreement.',
    rawConversation: `
Client (10:02 AM): I am extremely disappointed. We've been talking for three weeks and I still don't see the custom dashboard module.
User (10:05 AM): Hi Mark, the dashboard module wasn't in our initial Phase 1 agreement. We focused on the core API integration first.
Client (10:06 AM): I don't care what the "Phase 1" said. I'm paying you $5,000 a month and I expect a dashboard. This is ridiculous. If I don't see a demo by Friday, I'm cancelling the contract.
Client (10:07 AM): Also, I need you to add support for PostgreSQL, we decided to move away from MongoDB. This shouldn't take more than an hour, right?
`,
    expectedSignals: {
      sentiment: 'frustrated',
      riskLevel: 'high',
      hasScopeCreep: true,
      hasChurnRisk: true,
    }
  },
  {
    id: 'high-value-lead-negotiation',
    name: 'High-Value Lead / Pricing Negotiation',
    description: 'A serious prospect with a large budget asking about enterprise features and pricing.',
    rawConversation: `
Prospect (2:15 PM): Hello, I'm Sarah from GlobalTech. We're looking for a communication OS for our 500+ agent team.
User (2:20 PM): Hi Sarah! Great to hear from you. We've helped similar sized firms like TechCorp scale their operations.
Prospect (2:22 PM): Excellent. We need SSO, advanced audit logs, and a dedicated account manager. Our annual budget for this transition is around $150,000.
Prospect (2:23 PM): However, your standard Pro plan seems a bit limited. Do you offer enterprise volume discounts? We're comparing you with two other vendors right now but we prefer your UI.
`,
    expectedSignals: {
      sentiment: 'positive',
      leadQuality: 90,
      pricingSensitivity: 'medium',
      isDecisionMaker: true,
      hasBuyingIntent: true,
    }
  },
  {
    id: 'vague-requirements-payment-risk',
    name: 'Vague Requirements / Payment Risk',
    description: 'A client with unclear needs who is hesitant about paying upfront.',
    rawConversation: `
Client (9:00 AM): I need some AI stuff for my website. Just like, making it smarter.
User (9:10 AM): Could you clarify what features you need? e.g., a chatbot, content generation, or data analysis?
Client (9:15 AM): I don't know, just make it cool. How much?
User (9:20 AM): Our projects typically start at $2,000. We require a 50% deposit to begin.
Client (9:25 AM): $2,000? That's a lot for just some AI. Can you do it for free first and if I like it I'll pay you? I have a big network, I can bring you lots of clients.
`,
    expectedSignals: {
      riskLevel: 'critical',
      leadQuality: 10,
      paymentRisk: 'high',
      hasDiscountRequest: true,
      ambiguityLevel: 'high',
    }
  }
];
