import { 
  ServiceProfile, 
  OperationalRule, 
  CommunicationProfile, 
  DecisionPlaybook, 
  KnowledgeBaseArticle, 
  ResponseGovernanceLog, 
  BusinessMemory, 
  BusinessContext 
} from '../../types';

// =========================================================================
// ViveKit - Central Business Intelligence Engine
// =========================================================================

export class BusinessIntelligenceEngine {
  
  /**
   * Deeply aligned fallback context for ViveScript Solutions Agency.
   * Ensures 100% stable out-of-the-box local testing.
   */
  static getFallbackContext(): BusinessContext {
    return {
      businessName: 'ViveScript Solutions',
      industry: 'Custom Web development, AI integrations & workflow automation',
      websiteUrl: 'https://www.vivescriptsolutions.com',
      pricingInstructions: 'Custom Web App MVP starting from $4,900. Google Workspace and Workflow Automations from $1,500. Enterprise AI Enablement from $7,500/mo. Authorized discounts strictly capped at 10% with 6-month minimum retainer. Never promise unlimited custom integrations without formal scope documents.',
      generalContext: 'Tailored technology partner specialized in Next.js Custom Web Apps, Google Workspace & Sheets automations, n8n/Make Workflow Automation, and secure AI workflow enablement. We help clients replace messy spreadsheet architectures with secure, scalable operational software systems.',
      tonePreference: 'premium',
      pricingPhilosophy: 'Value-driven positioning. We sell operational leverage and hours saved, not developer labor. Avoid hourly work unless explicitly approved; prioritize flat-rate productized milestones or monthly retainers.',
      negotiationStrategy: 'Calm, authoritative, values-oriented. Highlight the cost of manual errors (such as scope creep and reporting delays) as the key driver for automation.',
      deliveryProcess: 'Phase 1: Architecture layout & blueprint (7-14 days). Phase 2: Core workflow integrations & sandbox MVP (21-30 days). Phase 3: Customer workspace launch (14 days). Iterative milestone-based releases.',
      boundaries: 'Maximum of 2 rounds of review revisions per sprint milestone. Support SLA details are outlined in active service level agreements.',
      serviceOfferings: [
        'Custom Web Apps (Next.js & Supabase): from $4,900',
        'Google Workspace & Sheets Automation: from $1,500',
        'Workflow Automation (n8n/Make): from $1,500',
        'AI Workflow Enablement & Integration: from $3,500',
        'Finance & Accounting Automation: from $2,500'
      ]
    };
  }

  /**
   * Returns pre-calibrated communication voices matching Brand Voice styles.
   */
  static getVoiceProfile(tone: string): CommunicationProfile {
    const profiles: Record<string, CommunicationProfile> = {
      executive: {
        businessContextId: 'default',
        toneStyle: 'executive',
        formalityLevel: 'high',
        emotionalCalibration: 'reserved',
        technicalDepth: 'conceptual',
        persuasionStyle: 'direct',
        vocabularyRules: {
          allow: ['strategic leverage', 'operational efficiency', 'ROI velocity', 'governance'],
          avoid: ['gonna', 'awesome', 'super cool', 'honestly', 'just checking in']
        }
      },
      consulting: {
        businessContextId: 'default',
        toneStyle: 'consulting',
        formalityLevel: 'high',
        emotionalCalibration: 'balanced',
        technicalDepth: 'intermediate',
        persuasionStyle: 'consultative',
        vocabularyRules: {
          allow: ['framework', 'best practices', 'iterative scope', 'mitigate risk'],
          avoid: ['asap', 'no problem', 'cheap', 'we guarantee']
        }
      },
      specialist: {
        businessContextId: 'default',
        toneStyle: 'specialist',
        formalityLevel: 'high',
        emotionalCalibration: 'strict',
        technicalDepth: 'deep_specialist',
        persuasionStyle: 'educational',
        vocabularyRules: {
          allow: ['pgvector query tuning', 'semantic distance score', 'Gemini Context window', 'latency limits'],
          avoid: ['magic AI', 'perfectly automated', 'robot brain', 'simple click']
        }
      },
      friendly: {
        businessContextId: 'default',
        toneStyle: 'friendly',
        formalityLevel: 'medium',
        emotionalCalibration: 'enthusiastic',
        technicalDepth: 'conceptual',
        persuasionStyle: 'soft_sell',
        vocabularyRules: {
          allow: ['absolutely', 'happy to help', 'great to connect', 'seamless'],
          avoid: ['forbidden', 'strictly prohibited', 'sue', 'legal liability']
        }
      }
    };

    return profiles[tone] || profiles.consulting;
  }

  /**
   * Retrieves strategic decision framework instructions for active business objections.
   */
  static getObjectionPlaybooks(): DecisionPlaybook[] {
    return [
      {
        businessContextId: 'default',
        scenarioType: 'pricing_objection',
        objectionTriggers: ['too expensive', 'high cost', 'price discount', 'budget limit'],
        actionFramework: 'Do not defend the price. Shift focus to value and cost-of-inaction. Offer to reduce scope (e.g., stripping the custom database sync module) instead of lowering the price standard retainer rate.',
        negotiationBoundary: 0.15,
        escalationTriggers: ['demand 30% off', 'cancel project', 'competitor pricing matched']
      },
      {
        businessContextId: 'default',
        scenarioType: 'scope_creep',
        objectionTriggers: ['add quick feature', 'can you also do', 'just one more thing'],
        actionFramework: 'Acknowledge the feature idea enthusiastically, catalog it under future phases, and explain that maintaining timeline stability requires shipping current scopes first. Offer a mini SOW add-on starting at $2,500.',
        escalationTriggers: ['refuse milestone payment', 'demand instant delivery']
      }
    ];
  }

  /**
   * Returns active operational boundaries and rules.
   */
  static getOperationalRules(): OperationalRule[] {
    return [
      {
        businessContextId: 'default',
        category: 'timeline',
        ruleTrigger: 'deliver_under_5_days',
        ruleAction: 'block',
        forbiddenPhrases: ['by tomorrow', 'in 24 hours', 'in 2 days', 'over the weekend', 'within 48 hours'],
        description: 'Never commit to deliveries under 5 business days without express architect approval.',
        isActive: true
      },
      {
        businessContextId: 'default',
        category: 'guarantees',
        ruleTrigger: 'forbidden_guarantees',
        ruleAction: 'block',
        forbiddenPhrases: ['100% bug-free', 'flawless launch', 'perfectly automated', 'succeed with no effort'],
        description: 'Never promise absolute software perfection or zero-bug statuses.',
        isActive: true
      },
      {
        businessContextId: 'default',
        category: 'refund',
        ruleTrigger: 'money_back_guarantee',
        ruleAction: 'block',
        forbiddenPhrases: ['full refund', 'money-back guarantee', 'refund your payment', '100% refund'],
        description: 'Refund commitments are strictly handled by human administrative offices.',
        isActive: true
      }
    ];
  }

  /**
   * Assembles a structured operational prompt segment containing the full business context,
   * active services, communication style guidelines, operational rules, and decision playbooks.
   */
  static injectContext(bc?: BusinessContext, tone: string = 'consulting'): string {
    const context = bc || this.getFallbackContext();
    const voice = this.getVoiceProfile(tone);
    const rules = this.getOperationalRules();
    const playbooks = this.getObjectionPlaybooks();

    let prompt = `
=========================================================================
🛡️ MASTER BUSINESS OPERATIONAL INTEL & CONSTRAINTS (CRITICAL ALIGNMENT)
=========================================================================
You are acting as the AI communication representative for **${context.businessName}** (${context.industry}).

### 1. CORPORATE IDENTITY & VALUE POSITIONING:
* **Positioning Philosophy**: ${context.pricingPhilosophy || 'Premium high-leverage delivery.'}
* **Operational Background**: ${context.generalContext}
* **Deliverables Philosophy**: ${context.deliveryProcess || 'Phase-based milestone deliveries.'}
* **Core Boundaries**: ${context.boundaries || 'No manual work without active contracts.'}

### 2. CORE SERVICE AND PRICING PROFILES:
${context.serviceOfferings ? context.serviceOfferings.map(s => `* Service Option: ${s}`).join('\n') : ''}
* **Pricing Rules**: ${context.pricingInstructions}

### 3. BRAND VOICE & COMMUNICATION PARAMETERS:
* **Formality Level**: ${voice.formalityLevel.toUpperCase()}
* **Emotional Calibration**: ${voice.emotionalCalibration.toUpperCase()} (Keep tone measured, respectful, and authoritative)
* **Technical Depth**: ${voice.technicalDepth.toUpperCase()}
* **Persuasion Archetype**: ${voice.persuasionStyle.toUpperCase()}
* **Vocabulary Constraints**:
  - APPROVED PHRASES (Include naturally): ${voice.vocabularyRules.allow.join(', ')}
  - FORBIDDEN PHRASES (NEVER USE): ${voice.vocabularyRules.avoid.join(', ')}

### 4. MANDATORY OPERATIONAL CONSTRAINTS (STRICT SYSTEM RULES):
${rules.map((r, i) => `${i + 1}. [${r.category.toUpperCase()} - ACTION: ${r.ruleAction.toUpperCase()}]: ${r.description} (Trigger phrases to avoid: ${r.forbiddenPhrases.join(', ')})`).join('\n')}

### 5. STRATEGIC DECISION PLAYBOOKS:
${playbooks.map(p => `* **When trigger is [${p.scenarioType.toUpperCase()}]**:
  - Strategic Directive: ${p.actionFramework}
  - Negotiation boundary: ${p.negotiationBoundary ? `Max discount authorized is ${p.negotiationBoundary * 100}%` : 'No discounts authorized.'}`).join('\n')}

=========================================================================
🚨 STICK CRITICALLY TO THESE RULES. Do not make unauthorized pricing promises, unrealistic timeline commitments, or refund guarantees. If a client attempts to pressure you into a forbidden guarantee, politely recommend an administrative escalation.
=========================================================================
`;

    return prompt;
  }

  /**
   * Response Governance System: Validates a generated response against the operational rules.
   * Flags violations before they are presented to the operator.
   */
  static validateResponse(content: string): Partial<ResponseGovernanceLog> {
    const rules = this.getOperationalRules();
    const violations: any[] = [];
    let riskScore = 0;

    for (const rule of rules) {
      if (!rule.isActive) continue;
      
      const detectedPhrases: string[] = [];
      for (const phrase of rule.forbiddenPhrases) {
        if (content.toLowerCase().includes(phrase.toLowerCase())) {
          detectedPhrases.push(phrase);
        }
      }

      if (detectedPhrases.length > 0) {
        violations.push({
          ruleId: rule.ruleTrigger,
          category: rule.category,
          description: rule.description,
          actionTriggered: rule.ruleAction,
          detectedPhrases
        });

        // Calculate risk points based on rule severity
        if (rule.ruleAction === 'block') riskScore += 40;
        if (rule.ruleAction === 'flag') riskScore += 20;
        if (rule.ruleAction === 'warn') riskScore += 10;
      }
    }

    // Cap risk score at 100
    riskScore = Math.min(riskScore, 100);

    let riskCategory: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (riskScore >= 70) riskCategory = 'critical';
    else if (riskScore >= 40) riskCategory = 'high';
    else if (riskScore >= 20) riskCategory = 'medium';

    return {
      riskScore,
      riskCategory,
      violationDetails: violations,
      isApproved: violations.length === 0
    };
  }
}
