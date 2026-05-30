/**
 * ViveKit Phase 11 - Human Approval Workflow & Operational Safety Types
 */

export type ApprovalState = 
  | 'draft' 
  | 'pending_review' 
  | 'edited' 
  | 'approved' 
  | 'rejected' 
  | 'archived' 
  | 'escalated';

export interface RiskAssessment {
  score: number; // 0-100 overall risk
  overpromisingRating: number; // 0-100
  pricingInconsistency: boolean;
  legalRiskRating: number; // 0-100
  scopeLeakage: boolean;
  hallucinationRisk: number; // 0-100
  warningIndicators: string[];
  suggestedRevisions: string[];
}

export interface ApprovalWorkflow {
  id: string;
  conversationId: string;
  clientName: string;
  activeState: ApprovalState;
  riskAssessment: RiskAssessment;
  originalDraft: string;
  currentText: string;
  revisionsCount: number;
  assignedReviewer?: string;
  businessPriority: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowAuditLog {
  id: string;
  workflowId: string;
  action: 'create' | 'edit' | 'approve' | 'reject' | 'escalate' | 'rollback';
  performedBy: string;
  previousState: ApprovalState;
  nextState: ApprovalState;
  textDelta?: string;
  timestamp: string;
}

export interface ApprovalAnalytics {
  approvalRate: number; // Percentage
  averageEditCount: number;
  policyViolationCount: number;
  escalationRate: number;
  totalProcessedCount: number;
  aiAcceptanceRatio: number;
}
