import { PromptModule } from '../../types';
import { BusinessIntelligenceEngine } from '../../business-engine';

export const businessContext: PromptModule = {
  id: 'business-context',
  name: 'Business Profile Context',
  version: '1.0.0',
  description: 'Injects the business-specific profile, services, tone profiles, and operational rule engine parameters.',
  priority: 20,
  content: (config) => {
    const { businessContext: bc, selectedTone } = config;
    
    // Inject dynamic operational context through the Business Intelligence Engine
    return BusinessIntelligenceEngine.injectContext(bc, selectedTone || 'consulting');
  }
};
