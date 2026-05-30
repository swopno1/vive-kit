import { PromptModule } from '../../types';

export const outputFormat: PromptModule = {
  id: 'output-format',
  name: 'Output Format Control',
  version: '1.0.0',
  description: 'Strict adherence to requested JSON schemas.',
  priority: 100,
  content: (config) => {
    if (config.task === 'analyze' || config.task === 'extract') {
      return `### CRITICAL: OUTPUT FORMAT
You must output ONLY a valid JSON object. Do not include any text before or after the JSON.
Ensure the JSON strictly follows the required schema for the task.`;
    }

    return '';
  }
};
