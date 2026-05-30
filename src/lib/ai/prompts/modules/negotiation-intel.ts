import { PromptModule } from '../../types';

export const negotiationIntel: PromptModule = {
  id: 'negotiation-intel',
  name: 'Negotiation Intelligence',
  version: '1.0.0',
  description: 'Specialized logic for handling pricing, scope, and objections.',
  priority: 40,
  content: (config) => {
    const { negotiationMode = 'standard', businessContext } = config;
    const strategy = businessContext?.negotiationStrategy || 'Maintain profitability while preserving the relationship.';

    let content = `### NEGOTIATION STRATEGY:
Current Mode: **${negotiationMode.toUpperCase()}**
Base Strategy: ${strategy}

Operational Rules:
1. **Protect Profitability**: Do not offer discounts or concessions unless explicitly authorized in the business context.
2. **Value First**: Always re-frame pricing objections by highlighting the value and ROI of the services.
3. **Scope Control**: If a client requests more than what is agreed, politely explain the scope and offer a separate proposal for the additional work.
4. **Professional Firmness**: Be respectful but firm on business boundaries.`;

    if (negotiationMode === 'premium') {
      content += `\n\nSpecial Instruction: Position our services as the high-end choice where quality justifies the investment. Avoid competing on price.`;
    } else if (negotiationMode === 'protective') {
      content += `\n\nSpecial Instruction: Focus heavily on adherence to existing contracts and timelines. Minimize any changes to the current agreement.`;
    }

    return content;
  }
};
