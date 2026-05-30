-- =========================================================================
-- Supabase DB Migration - Phase 15: SaaS Security Hardening & Compliance
-- =========================================================================

-- 1. Security Incidents Auditing Registry
CREATE TABLE IF NOT EXISTS public.crm_security_incidents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL, -- rate_limit_exceeded, SQL_injection, prompt_injection
  severity text NOT NULL, -- low, medium, high, critical
  details text NOT NULL,
  workspace_id text NOT NULL,
  timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.crm_security_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to crm_security_incidents" ON public.crm_security_incidents
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_crm_security_incidents_workspace ON public.crm_security_incidents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_crm_security_incidents_time ON public.crm_security_incidents(timestamp);


-- 2. GDPR Compliance Requests Ledger
CREATE TABLE IF NOT EXISTS public.crm_gdpr_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id text NOT NULL,
  request_type text NOT NULL, -- export, delete
  requester_email text NOT NULL,
  status text DEFAULT 'pending' NOT NULL, -- pending, completed
  timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.crm_gdpr_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to crm_gdpr_requests" ON public.crm_gdpr_requests
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_crm_gdpr_requests_workspace ON public.crm_gdpr_requests(workspace_id);


-- 3. Disaster Recovery Backups Log
CREATE TABLE IF NOT EXISTS public.crm_disaster_backups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  backup_type text NOT NULL, -- database, vector_memory, config
  size_bytes bigint DEFAULT 0 NOT NULL,
  backup_url text NOT NULL,
  status text DEFAULT 'success' NOT NULL, -- success, failed
  timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.crm_disaster_backups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to crm_disaster_backups" ON public.crm_disaster_backups
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_crm_disaster_backups_time ON public.crm_disaster_backups(timestamp);
