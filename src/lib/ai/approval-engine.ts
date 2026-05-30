import { RiskAssessment } from '../../types/approval';

export class ApprovalEngine {
  public static evaluateDraftRisk(draft: string): RiskAssessment {
    const text = draft.toLowerCase();

    let overpromisingRating = 10;
    let pricingInconsistency = false;
    let legalRiskRating = 5;
    let scopeLeakage = false;
    const warningIndicators: string[] = [];
    const suggestedRevisions: string[] = [];

    if (text.includes('guarantee') || text.includes('promise') || text.includes('100%') || text.includes('immediate')) {
      overpromisingRating += 50;
      warningIndicators.push("⚠ Overpromising Warning: Draft contains absolute guarantees ('guarantee', 'promise', '100%').");
      suggestedRevisions.push("Soften absolute timeline guarantees. Use 'target delivery windows' or 'estimated schedules'.");
    }

    if (text.includes('free') || text.includes('discount') || text.includes('refund') || text.includes('cut rates')) {
      pricingInconsistency = true;
      overpromisingRating += 20;
      warningIndicators.push("⚠ Pricing Alert: Potential discount/refund concession found ('refund', 'discount', 'free').");
      suggestedRevisions.push("Consult pricing instructions before confirming monetary concessions.");
    }

    if (text.includes('liability') || text.includes('breach') || text.includes('lawsuit') || text.includes('penalty')) {
      legalRiskRating += 75;
      warningIndicators.push("⚠ Legal Risk: Draft references legal terminology ('liability', 'breach').");
      suggestedRevisions.push("Remove raw legal jargon. Direct dispute toward an executive huddle.");
    }

    if (text.includes('extra free work') || text.includes('bonus feature') || text.includes('no extra charge')) {
      scopeLeakage = true;
      warningIndicators.push("⚠ Scope Leakage: Draft offers free feature additions ('no extra charge').");
      suggestedRevisions.push("Lock feature scope. Position new requests as modular sprint add-ons.");
    }

    const rawScore = (overpromisingRating * 0.3) + (pricingInconsistency ? 30 : 0) + (legalRiskRating * 0.4) + (scopeLeakage ? 20 : 0);
    const score = Math.max(0, Math.min(100, Math.round(rawScore)));

    return {
      score,
      overpromisingRating,
      pricingInconsistency,
      legalRiskRating,
      scopeLeakage,
      hallucinationRisk: text.includes('http') || text.includes('www') ? 25 : 5,
      warningIndicators,
      suggestedRevisions,
    };
  }
}
