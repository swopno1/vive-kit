import { PromptModule } from '../../types';

export const memoryContext: PromptModule = {
  id: 'memory-context',
  name: 'Semantic Memory Injection',
  version: '1.0.0',
  description: 'Injects relevant RAG snippets with ranking and efficiency logic.',
  priority: 25,
  content: (config) => {
    const { memorySnippets } = config;
    if (!memorySnippets || memorySnippets.length === 0) return '';

    // Logic for ranking/filtering could go here. For now, we format them clearly.
    const formattedMemories = memorySnippets
      .slice(0, 5) // Token efficiency: only take top 5
      .map((snippet, idx) => `[Memory #${idx + 1}]:\n${snippet}`)
      .join('\n\n');

    return `### SEMANTIC MEMORY / PAST CONTEXT:
The following snippets represent relevant historical data, previous conversations, or company knowledge. Use them as the primary source of truth for facts.

${formattedMemories}

Note: If information in a memory snippet contradicts general knowledge, prioritize the memory snippet.`;
  }
};
