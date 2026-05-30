import { PromptModule } from '../../types';

export const customerAnalysis: PromptModule = {
  id: 'customer-analysis',
  name: 'Conversation Analysis',
  version: '1.0.0',
  description: 'Analysis prompts for structured intelligence extraction.',
  priority: 15,
  content: (config) => {
    if (config.task !== 'analyze') return '';

    return `### ANALYSIS OBJECTIVES:
Perform a deep analysis of the provided conversation. Extract the following intelligence:
1. **Sentiment**: Identify the primary emotional state (Positive, Neutral, Negative, Frustrated).
2. **Urgency**: Determine if the request requires immediate action (Low, Medium, High).
3. **Lead Quality**: Score the lead from 0-100 based on intent and business alignment.
4. **Objections**: List any specific barriers or concerns mentioned by the client.
5. **Suggested Strategy**: Recommend the best tactical approach for the next reply.

Output the analysis in the requested JSON schema.`;
  }
};
