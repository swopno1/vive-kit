/**
 * ViveKit Phase 15 - Production Deployment, Security Hardening & Compliance Types
 */

export interface SecurityIncident {
  id: string;
  eventType: 'rate_limit_exceeded' | 'suspicious_activity' | 'sql_injection_attempt' | 'prompt_injection_blocked';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  workspaceId: string;
  timestamp: string;
}

export interface GDPRRequest {
  id: string;
  workspaceId: string;
  requestType: 'export' | 'delete';
  requesterEmail: string;
  status: 'pending' | 'completed';
  timestamp: string;
}

export interface BackupStatus {
  id: string;
  backupType: 'database' | 'vector_memory' | 'config';
  sizeBytes: number;
  backupUrl: string;
  status: 'success' | 'failed';
  timestamp: string;
}

export interface SecurityHardeningConfig {
  csrfProtection: boolean;
  apiRateLimitingEnabled: boolean;
  promptInjectionScannerActive: boolean;
  autoDataAnonymization: boolean;
}

export interface ComplianceDashboardPayload {
  incidents: SecurityIncident[];
  gdprRequests: GDPRRequest[];
  backups: BackupStatus[];
  hardening: SecurityHardeningConfig;
}
