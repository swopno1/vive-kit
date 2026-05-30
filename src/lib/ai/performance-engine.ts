import { RoutingDecision, ModelChoice } from '../../types/performance';

export class PerformanceEngine {
  public static determineRouting(
    promptText: string,
    priority: 'retention' | 'profitability' | 'neutral',
    clientArchetype: 'vip' | 'demanding' | 'growth'
  ): RoutingDecision {
    const textLength = promptText.length;
    let complexityScore = 20;

    if (textLength > 1000) complexityScore += 30;
    else if (textLength > 500) complexityScore += 15;

    if (clientArchetype === 'vip') complexityScore += 30;
    else if (clientArchetype === 'demanding') complexityScore += 15;

    if (priority === 'profitability') complexityScore += 20;
    else if (priority === 'retention') complexityScore += 10;

    let modelChosen: ModelChoice = 'gemini-flash';
    let rationale = 'Low-complexity request routed to Gemini 2.0 Flash.';

    if (complexityScore >= 60) {
      modelChosen = 'gemini-pro';
      rationale = 'High-complexity task routed to Gemini 2.0 Pro.';
    }

    const promptTokensForecast = Math.ceil(textLength / 4) + 120;
    const estimatedCostUSD = modelChosen === 'gemini-pro'
      ? promptTokensForecast * 0.00000125
      : promptTokensForecast * 0.0000001;

    return { modelChosen, rationale, complexityScore, promptTokensForecast, estimatedCostUSD };
  }
}
