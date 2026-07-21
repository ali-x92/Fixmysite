create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  url text not null,
  domain text not null,
  created_at timestamptz not null default now(),
  unique (user_id, domain)
);

create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  status text not null check (status in ('queued', 'running', 'completed', 'failed')),
  overall_score integer check (overall_score between 0 and 100),
  seo_score integer check (seo_score between 0 and 100),
  performance_score integer check (performance_score between 0 and 100),
  accessibility_score integer check (accessibility_score between 0 and 100),
  security_score integer check (security_score between 0 and 100),
  mobile_score integer check (mobile_score between 0 and 100),
  ux_score integer check (ux_score between 0 and 100),
  executive_summary text,
  created_at timestamptz not null default now()
);

create table public.issues (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses (id) on delete cascade,
  category text not null,
  severity text not null check (severity in ('critical', 'high', 'medium', 'low', 'info')),
  title text not null,
  description text not null,
  recommendation text not null,
  estimated_fix_time text not null
);

create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses (id) on delete cascade,
  priority integer not null check (priority > 0),
  title text not null,
  description text not null,
  expected_impact text not null
);

create index sites_user_id_idx on public.sites (user_id);
create index analyses_site_id_created_at_idx on public.analyses (site_id, created_at desc);
create index issues_analysis_id_idx on public.issues (analysis_id);
create index recommendations_analysis_id_idx on public.recommendations (analysis_id);
