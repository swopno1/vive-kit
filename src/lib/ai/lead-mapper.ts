import { LeadDataExtraction } from './intelligence/schemas';
import { CRMClientProfile, EditableLeadInfo } from '../../types';

/**
 * LeadMapper
 *
 * Utility to auto-populate CRM fields from extracted lead data.
 * Applies confidence-based filtering to only populate high-confidence extractions.
 */
export class LeadMapper {
  /**
   * Maps extracted lead data to editable lead info fields.
   * Only populates fields with confidence >= minConfidence threshold.
   *
   * @param leadData - Extracted lead data with confidence scores
   * @param minConfidence - Minimum confidence threshold (default: 0.7)
   * @returns Editable lead info with contact fields
   */
  static mapToCRMProfile(
    leadData: LeadDataExtraction,
    minConfidence: number = 0.7
  ): EditableLeadInfo {
    const profile: EditableLeadInfo = {};

    // Map firstName
    if (leadData.firstName.value && leadData.firstName.confidence >= minConfidence) {
      profile.firstName = leadData.firstName.value;
    }

    // Map lastName
    if (leadData.lastName.value && leadData.lastName.confidence >= minConfidence) {
      profile.lastName = leadData.lastName.value;
    }

    // Map email
    if (leadData.email.value && leadData.email.confidence >= minConfidence) {
      profile.email = leadData.email.value;
    }

    // Map phone
    if (leadData.phone.value && leadData.phone.confidence >= minConfidence) {
      profile.phone = leadData.phone.value;
    }

    // Map company
    if (leadData.company.value && leadData.company.confidence >= minConfidence) {
      profile.company = leadData.company.value;
    }

    // Map service interest as comma-separated string
    if (leadData.serviceInterest.values.length > 0 && leadData.serviceInterest.confidence >= minConfidence) {
      profile.serviceInterest = leadData.serviceInterest.values.join(', ');
    }

    return profile;
  }

  /**
   * Gets confidence breakdown for extracted lead data.
   * Useful for UI display and user review.
   *
   * @param leadData - Extracted lead data
   * @returns Object showing confidence for each field
   */
  static getConfidenceBreakdown(leadData: LeadDataExtraction) {
    return {
      firstName: {
        value: leadData.firstName.value || 'Not found',
        confidence: (leadData.firstName.confidence * 100).toFixed(0) + '%',
        source: leadData.firstName.source || 'Unknown',
      },
      lastName: {
        value: leadData.lastName.value || 'Not found',
        confidence: (leadData.lastName.confidence * 100).toFixed(0) + '%',
        source: leadData.lastName.source || 'Unknown',
      },
      email: {
        value: leadData.email.value || 'Not found',
        confidence: (leadData.email.confidence * 100).toFixed(0) + '%',
        source: leadData.email.source || 'Unknown',
      },
      phone: {
        value: leadData.phone.value || 'Not found',
        confidence: (leadData.phone.confidence * 100).toFixed(0) + '%',
        source: leadData.phone.source || 'Unknown',
      },
      company: {
        value: leadData.company.value || 'Not found',
        confidence: (leadData.company.confidence * 100).toFixed(0) + '%',
        source: leadData.company.source || 'Unknown',
      },
      serviceInterest: {
        values: leadData.serviceInterest.values.length > 0 ? leadData.serviceInterest.values : ['Not found'],
        confidence: (leadData.serviceInterest.confidence * 100).toFixed(0) + '%',
        source: leadData.serviceInterest.source || 'Unknown',
      },
      overall: {
        confidence: (leadData.overallConfidence * 100).toFixed(0) + '%',
        quality: getQualityRating(leadData.overallConfidence),
      },
    };
  }

  /**
   * Filters extractedlead data by confidence threshold.
   * Only returns fields that meet the minimum confidence.
   *
   * @param leadData - Extracted lead data
   * @param minConfidence - Minimum confidence threshold
   * @returns Filtered lead data with only confident extractions
   */
  static filterByConfidence(leadData: LeadDataExtraction, minConfidence: number = 0.7): LeadDataExtraction {
    return {
      firstName: leadData.firstName.confidence >= minConfidence ? leadData.firstName : { value: undefined, confidence: 0, source: undefined },
      lastName: leadData.lastName.confidence >= minConfidence ? leadData.lastName : { value: undefined, confidence: 0, source: undefined },
      email: leadData.email.confidence >= minConfidence ? leadData.email : { value: undefined, confidence: 0, source: undefined },
      phone: leadData.phone.confidence >= minConfidence ? leadData.phone : { value: undefined, confidence: 0, source: undefined },
      company: leadData.company.confidence >= minConfidence ? leadData.company : { value: undefined, confidence: 0, source: undefined },
      serviceInterest: leadData.serviceInterest.confidence >= minConfidence
        ? leadData.serviceInterest
        : { values: [], confidence: 0, source: undefined },
      overallConfidence: leadData.overallConfidence,
    };
  }
}

/**
 * Helper: Get quality rating based on confidence score
 */
function getQualityRating(confidence: number): string {
  if (confidence >= 0.9) return 'Excellent';
  if (confidence >= 0.8) return 'Very Good';
  if (confidence >= 0.7) return 'Good';
  if (confidence >= 0.5) return 'Fair';
  return 'Poor';
}
