-- =========================================================================
-- Supabase DB Migration - Phase 13: SaaS Workspace Tenancy & Team Roles
-- =========================================================================

-- 1. SaaS Workspaces Tenants Table
CREATE TABLE IF NOT EXISTS public.crm_workspaces (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  tenant_id text NOT NULL UNIQUE,
  plan text NOT NULL DEFAULT 'free', -- free, growth, enterprise
  max_seats integer DEFAULT 5 NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.crm_workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to crm_workspaces" ON public.crm_workspaces
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_crm_workspaces_tenant_id ON public.crm_workspaces(tenant_id);


-- 2. Workspace Members & Access Roles (RBAC) Table
CREATE TABLE IF NOT EXISTS public.crm_workspace_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid REFERENCES public.crm_workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'agent', -- owner, admin, manager, agent, viewer
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.crm_workspace_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to crm_workspace_members" ON public.crm_workspace_members
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_crm_workspace_members_workspace ON public.crm_workspace_members(workspace_id);


-- 3. Workspace Onboarding Invitations Table
CREATE TABLE IF NOT EXISTS public.crm_workspace_invitations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid REFERENCES public.crm_workspaces(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'agent',
  invited_by text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, accepted, expired
  expires_at timestamp with time zone NOT NULL
);

ALTER TABLE public.crm_workspace_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to crm_workspace_invitations" ON public.crm_workspace_invitations
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_crm_workspace_invitations_workspace ON public.crm_workspace_invitations(workspace_id);


-- 4. Shared Collaboration Comments Table
CREATE TABLE IF NOT EXISTS public.crm_collaboration_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_role text NOT NULL,
  text text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.crm_collaboration_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to crm_collaboration_comments" ON public.crm_collaboration_comments
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_crm_collaboration_comments_conversation ON public.crm_collaboration_comments(conversation_id);
