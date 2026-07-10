-- Ebbli Build — Foundation Migration
-- Run in Supabase SQL Editor

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for full-text search

-- ─── PROFILES ─────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  phone text,
  avatar_url text,
  user_type text not null default 'homeowner'
    check (user_type in ('homeowner','architect','engineer','qs','contractor','interior','landscape','developer','admin')),
  county text,
  subscription_tier text not null default 'free'
    check (subscription_tier in ('free','starter','pro','enterprise')),
  subscription_expires_at timestamptz,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── ORGANIZATIONS ────────────────────────────────────────────────────────
create table public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  plan text not null default 'free'
    check (plan in ('free','starter','pro','enterprise')),
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.organizations enable row level security;

create table public.org_members (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member'
    check (role in ('owner','admin','member','viewer')),
  joined_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

alter table public.org_members enable row level security;

create policy "Org members can view their org"
  on public.organizations for select
  using (
    owner_id = auth.uid() or
    exists (select 1 from public.org_members where org_id = id and user_id = auth.uid())
  );

create policy "Org owners can update"
  on public.organizations for update using (owner_id = auth.uid());

create policy "Org owners can insert"
  on public.organizations for insert with check (owner_id = auth.uid());

create policy "Members can view their orgs"
  on public.org_members for select using (user_id = auth.uid());

-- ─── PROJECTS ─────────────────────────────────────────────────────────────
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  org_id uuid references public.organizations(id) on delete set null,
  name text not null,
  status text not null default 'draft'
    check (status in ('draft','active','on_hold','completed','archived')),
  project_type text not null default 'residential'
    check (project_type in ('residential','apartment','commercial','mixed_use','renovation','plot_planning')),
  plot_size_sqm numeric,
  budget_kes bigint,
  location_county text,
  location_area text,
  floors integer,
  bedrooms integer,
  brief_data jsonb not null default '{}',
  phases_unlocked text[] not null default array['architect'],
  cover_image_url text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Users can view own projects"
  on public.projects for select
  using (
    (owner_id = auth.uid() or
     exists (select 1 from public.org_members where org_id = projects.org_id and user_id = auth.uid()))
    and deleted_at is null
  );

create policy "Users can insert own projects"
  on public.projects for insert with check (owner_id = auth.uid());

create policy "Users can update own projects"
  on public.projects for update using (owner_id = auth.uid());

create index idx_projects_owner on public.projects(owner_id);
create index idx_projects_org on public.projects(org_id);
create index idx_projects_status on public.projects(status);

-- ─── AI SESSIONS ──────────────────────────────────────────────────────────
create table public.ai_sessions (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  agent_type text not null
    check (agent_type in ('architect','qs','cost_optimizer','structural','render','interior','landscape','construction','planner')),
  messages jsonb not null default '[]',
  output_data jsonb,
  status text not null default 'active'
    check (status in ('active','complete','error')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_sessions enable row level security;

create policy "Users can view own ai sessions"
  on public.ai_sessions for select using (user_id = auth.uid());

create policy "Users can insert own ai sessions"
  on public.ai_sessions for insert with check (user_id = auth.uid());

create policy "Users can update own ai sessions"
  on public.ai_sessions for update using (user_id = auth.uid());

create index idx_ai_sessions_project on public.ai_sessions(project_id);
create index idx_ai_sessions_user on public.ai_sessions(user_id);

-- ─── PROJECT FILES ────────────────────────────────────────────────────────
create table public.project_files (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  file_type text not null default 'other'
    check (file_type in ('drawing','photo','report','boq','contract','other')),
  storage_path text not null,
  name text not null,
  size_bytes bigint not null,
  mime_type text not null,
  created_at timestamptz not null default now()
);

alter table public.project_files enable row level security;

create policy "Users can view files for own projects"
  on public.project_files for select
  using (
    exists (select 1 from public.projects where id = project_id and owner_id = auth.uid())
  );

create policy "Users can upload files to own projects"
  on public.project_files for insert
  with check (
    exists (select 1 from public.projects where id = project_id and owner_id = auth.uid())
  );

create index idx_project_files_project on public.project_files(project_id);

-- ─── PAYMENTS ─────────────────────────────────────────────────────────────
create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount_kes integer not null,
  purpose text not null
    check (purpose in ('subscription','phase_unlock','marketplace_booking')),
  status text not null default 'pending'
    check (status in ('pending','completed','failed','refunded')),
  pesapal_order_id text,
  pesapal_tracking_id text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "Users can view own payments"
  on public.payments for select using (user_id = auth.uid());

create policy "Users can insert own payments"
  on public.payments for insert with check (user_id = auth.uid());

create index idx_payments_user on public.payments(user_id);
create index idx_payments_pesapal_order on public.payments(pesapal_order_id);

-- ─── NOTIFICATIONS ────────────────────────────────────────────────────────
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null
    check (type in ('ai_complete','payment','project_update','marketplace','system')),
  title text not null,
  body text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users can view own notifications"
  on public.notifications for select using (user_id = auth.uid());

create policy "Users can update own notifications"
  on public.notifications for update using (user_id = auth.uid());

create index idx_notifications_user_unread on public.notifications(user_id, read) where read = false;

-- ─── AUDIT LOGS ───────────────────────────────────────────────────────────
create table public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  ip text,
  user_agent text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

-- Immutable — no update or delete policies
create policy "Users can view own audit logs"
  on public.audit_logs for select using (user_id = auth.uid());

-- Service role inserts only (from server)
create index idx_audit_logs_user on public.audit_logs(user_id);
create index idx_audit_logs_created on public.audit_logs(created_at desc);

-- ─── STORAGE BUCKETS ──────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values
  ('project-files', 'project-files', false),
  ('ai-renders', 'ai-renders', false),
  ('avatars', 'avatars', true),
  ('org-logos', 'org-logos', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload project files"
  on storage.objects for insert
  with check (
    bucket_id = 'project-files' and
    auth.uid() is not null
  );

create policy "Users can view own project files"
  on storage.objects for select
  using (
    bucket_id = 'project-files' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─── UPDATED AT TRIGGER ───────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger set_orgs_updated_at before update on public.organizations
  for each row execute procedure public.set_updated_at();
create trigger set_projects_updated_at before update on public.projects
  for each row execute procedure public.set_updated_at();
create trigger set_ai_sessions_updated_at before update on public.ai_sessions
  for each row execute procedure public.set_updated_at();
create trigger set_payments_updated_at before update on public.payments
  for each row execute procedure public.set_updated_at();
