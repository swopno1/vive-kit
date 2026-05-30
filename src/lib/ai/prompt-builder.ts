import { AIRequestConfig } from './types';
import { PromptManager } from './prompts/prompt-manager';

/**
 * Reusable and modular prompt builder for the AI OS Workspace.
 * Construct system instructions and message payloads dynamically.
 * Refactored in Phase 4 to use PromptManager and modular modules.
 */
export class PromptBuilder {
  
  /**
   * Constructs the master system instructions based on the application state.
   */
  static buildSystemInstructions(config: AIRequestConfig): string {
    // Determine which modules to include based on task
    let moduleIds: string[] = [
      'base-identity',
      'business-context',
      'memory-context',
      'tone-control',
      'risk-control',
      'output-format'
    ];

    if (config.task === 'negotiate' || config.task === 'reply') {
      moduleIds.push('negotiation-intel');
    }

    if (config.task === 'analyze') {
      moduleIds = [
        "intelligence-orchestrator",
        "risk-engine",
        "negotiation-analyzer",
        "entity-extractor",
        'base-identity',
        'customer-analysis',
        'business-context', // Analysis needs context
        'memory-context'
      ];
    }

    // Token-aware optimization: If memory is too large, we might truncate here.
    // For Phase 4, the truncation logic is inside memory-context.ts (slice(0,5)).

    return PromptManager.compose(config, moduleIds);
  }

  /**
   * Constructs the message prompt block including raw chat context and tactical operator rules.
   */
  static buildMessages(config: AIRequestConfig): any[] {
    const { rawConversation, additionalInstructions } = config;

    let userPrompt = `### CONVERSATION HISTORY:
------------------
${rawConversation}
------------------

`;

    if (additionalInstructions && additionalInstructions.trim().length > 0) {
      userPrompt += `### ADDITIONAL INSTRUCTIONS:
${additionalInstructions}

`;
    }

    userPrompt += `Please perform the requested task now.`;

    return [
      { role: 'user', content: userPrompt }
    ];
  }

  /**
   * Helper to get the current prompt system version.
   */
  static getSystemVersion(): string {
    return PromptManager.getVersion();
  }
}
