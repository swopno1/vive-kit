import { AIRequestConfig } from "../types";

export const TEST_SCENARIOS: Record<string, AIRequestConfig> = {
  angryClient: {
    task: "reply",
    rawConversation:
      "CLIENT: This is the third time I've asked for a refund! Your system is broken and I'm losing money. Fix this NOW or I'm calling my lawyer.",
    selectedTone: "empathetic",
    riskLevel: "high",
    businessContext: {
      businessName: "ViveKit Support",
      pricingInstructions:
        "Refunds must be approved by a manager. Offer a 1-month credit as an alternative.",
      generalContext: "AI-powered business communication platform.",
      tonePreference: "professional",
    },
  },
  pricingNegotiation: {
    task: "negotiate",
    rawConversation:
      "CLIENT: I love the tool, but $500/month is just too steep for our startup. Can you do $300? We have 5 other teams that might join next year.",
    selectedTone: "strategic",
    negotiationMode: "premium",
    businessContext: {
      businessName: "ViveKit",
      pricingInstructions:
        "Standard plan is $500. No discounts for startups. Focus on ROI.",
      pricingPhilosophy:
        "We provide premium value that pays for itself through efficiency.",
      generalContext: "B2B SaaS platform.",
      tonePreference: "strategic",
    },
  },
  upsellOpportunity: {
    task: "reply",
    rawConversation:
      "CLIENT: We're hitting our limit on the basic plan. How much is the next tier up?",
    selectedTone: "sales-focused",
    businessContext: {
      businessName: "ViveKit",
      pricingInstructions:
        "Basic: $99, Pro: $299. Pro includes advanced AI agents.",
      serviceOfferings: ["Basic Plan", "Pro Plan", "Enterprise Plan"],
      generalContext: "Scaling communication for modern teams.",
      tonePreference: "professional",
    },
  },
};
