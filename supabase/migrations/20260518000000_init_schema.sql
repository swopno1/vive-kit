-- =========================================================================
-- Supabase DB Migration - AI Customer Support Agent (RAG + pgvector)
-- =========================================================================

-- Enable the pgvector extension to work with semantic embeddings
create extension if not exists vector;

-- 1. Business Context Settings Table
create table if not exists public.business_contexts (
  id uuid default gen_random_uuid() primary key,
  business_name text not null,
  industry text,
  website_url text,
  pricing_instructions text not null, -- Specific guidelines on pricing, discounts, packages
  general_context text not null,       -- Broad details about products, services, FAQs, etc.
  tone_preference text default 'professional' not null, -- e.g., professional, casual, empathetic, urgent
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.business_contexts enable row level security;

-- Create policies (for simplicity, allow full access for authenticated/anon, customize for multi-tenant SaaS later)
create policy "Allow public access to business_contexts" on public.business_contexts
  for all using (true) with check (true);


-- 2. Customer Profile Table (CRM-like Context)
create table if not exists public.customer_profiles (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  first_name text,
  last_name text,
  company_name text,
  relationship_notes text,            -- Key relationship info (e.g. "VIP client", "Has active churn risk")
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.customer_profiles enable row level security;
create policy "Allow public access to customer_profiles" on public.customer_profiles
  for all using (true) with check (true);


-- 3. Conversation Logs (Past pasted conversations)
create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.customer_profiles(id) on delete set null,
  external_conversation_id text,      -- ID from external Zendesk, Intercom, or email thread
  channel text default 'email' not null, -- email, chat, sms
  raw_history text not null,           -- The raw pasted dialogue history
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.conversations enable row level security;
create policy "Allow public access to conversations" on public.conversations
  for all using (true) with check (true);


-- 4. Vector Memory (RAG) Table for Semantic Similarity Search
create table if not exists public.vector_memories (
  id uuid default gen_random_uuid() primary key,
  content text not null,              -- The text snippet (e.g. Q&A pair, specific service rule)
  embedding vector(768) not null,     -- Gemini Text Embedding API outputs 768-dimensional floats
  metadata jsonb default '{}'::jsonb not null, -- Source info, category tags, timestamp
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.vector_memories enable row level security;
create policy "Allow public access to vector_memories" on public.vector_memories
  for all using (true) with check (true);


-- 5. Suggested Replies & Workflow Approval Status
create table if not exists public.suggested_replies (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade,
  prompt_used text not null,
  generated_reply text not null,
  edited_reply text,                  -- The reply edited manually by the support agent
  status text default 'pending' not null, -- pending, approved, rejected, modified
  approved_by uuid,                   -- Support agent ID
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.suggested_replies enable row level security;
create policy "Allow public access to suggested_replies" on public.suggested_replies
  for all using (true) with check (true);


-- 6. Similarity Search Function for RAG Vector Lookup
create or replace function match_memories (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    id,
    content,
    metadata,
    1 - (vector_memories.embedding <=> query_embedding) as similarity
  from vector_memories
  where 1 - (vector_memories.embedding <=> query_embedding) > match_threshold
  order by vector_memories.embedding <=> query_embedding
  limit match_count;
$$;
