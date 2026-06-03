import { intelligenceOrchestrator } from "./modules/intelligence-orchestrator";
import { riskEngine } from "./modules/risk-engine";
import { negotiationAnalyzer } from "./modules/negotiation-analyzer";
import { entityExtractor } from "./modules/entity-extractor";
import { leadExtractor } from "./modules/lead-extractor";
import { PromptModule, PromptRegistry, AIRequestConfig } from '../types';
import { baseIdentity } from './modules/base-identity';
import { businessContext } from './modules/business-context';
import { toneControl } from './modules/tone-control';
import { negotiationIntel } from './modules/negotiation-intel';
import { memoryContext } from './modules/memory-context';
import { riskControl } from './modules/risk-control';
import { outputFormat } from './modules/output-format';
import { customerAnalysis } from './modules/customer-analysis';

export class PromptManager {
  private static registry: PromptRegistry = {
    'base-identity': baseIdentity,
    'business-context': businessContext,
    'tone-control': toneControl,
    'negotiation-intel': negotiationIntel,
    'memory-context': memoryContext,
    'risk-control': riskControl,
    'output-format': outputFormat,
    'customer-analysis': customerAnalysis,
    'intelligence-orchestrator': intelligenceOrchestrator,
    'risk-engine': riskEngine,
    'negotiation-analyzer': negotiationAnalyzer,
    'entity-extractor': entityExtractor,
    'lead-extractor': leadExtractor,
  };

  /**
   * Returns a list of modules ordered by priority.
   */
  static getModules(ids?: string[]): PromptModule[] {
    const modules = ids
      ? ids.map(id => this.registry[id]).filter(Boolean)
      : Object.values(this.registry);

    return modules.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Composes a full system prompt from selected modules.
   */
  static compose(config: AIRequestConfig, moduleIds?: string[]): string {
    const modules = this.getModules(moduleIds);

    // Filter modules based on task
    const activeModules = modules.filter(m => {
      if (config.task === 'analyze' && m.id === 'negotiation-intel') return false;
      if (config.task !== 'analyze' && m.id === 'customer-analysis') return false;
      return true;
    });

    return activeModules
      .map(m => m.content(config))
      .filter(content => content.trim().length > 0)
      .join('\n\n');
  }

  /**
   * Version tracking helper (placeholder for more complex logic)
   */
  static getVersion(): string {
    return '1.0.0-phase5';
  }
}
