import { PromptModule } from '../../types';

export const riskEngine: PromptModule = {
  id: 'risk-engine',
  name: 'Deep Risk Analysis',
  version: '1.0.0',
  description: 'Detailed risk assessment and mitigation strategy.',
  priority: 95,
  content: (config) => {
    if (config.task !== 'analyze') return '';

    return `### RISK ANALYSIS ENGINE:
Perform a clinical assessment of the business risk associated with this client interaction.
Focus on:
1. **Scope Creep**: Are they asking for things outside the original boundaries?
2. **Payment Risk**: Do they mention budget constraints or ask for free work?
3. **Communication Risk**: Is the tone aggressive, manipulative, or vague?
4. **Timeline Risk**: Are expectations for delivery unrealistic?
5. **Technical Risk**: Are they asking for things we cannot deliver?

Assign a risk score from 0 (Safe) to 100 (Critical) and provide specific mitigation steps.`;
  }
};
