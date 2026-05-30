import { PromptModule } from '../../types';

export const entityExtractor: PromptModule = {
  id: 'entity-extractor',
  name: 'Structured Entity Extractor',
  version: '1.0.0',
  description: 'Extracting key business entities from text.',
  priority: 30,
  content: (config) => {
    if (config.task !== 'analyze' && config.task !== 'extract') return '';

    return `### ENTITY EXTRACTION RULES:
Extract the following entities with high precision:
- **Names**: People mentioned.
- **Companies**: Organizations mentioned.
- **Budgets**: Specific dollar amounts or ranges.
- **Deadlines**: Specific dates or timeframes.
- **Deliverables**: Specific items or services requested.
- **Technologies**: Software, tools, or stacks mentioned.

Ensure values are clean and contextually accurate.`;
  }
};
