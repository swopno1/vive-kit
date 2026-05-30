import { PromptModule } from '../../types';

export const negotiationAnalyzer: PromptModule = {
  id: 'negotiation-analyzer',
  name: 'Negotiation Signal Analyzer',
  version: '1.0.0',
  description: 'Detecting subtle negotiation signals and buying intent.',
  priority: 45,
  content: (config) => {
    if (config.task !== 'analyze') return '';

    return `### NEGOTIATION SIGNAL DETECTION:
Identify subtle cues that indicate the client's position:
- **Buying Intent**: Are they asking "how" rather than "if"?
- **Discount Requests**: Are they fishing for a lower price?
- **Urgency Tactics**: Are they trying to rush the process to gain leverage?
- **Authority**: Do they sound like the final decision-maker?
- **Decision Stage**: Are they in the awareness, consideration, or decision stage?`;
  }
};
