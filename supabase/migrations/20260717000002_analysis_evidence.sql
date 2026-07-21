alter table public.issues add column source text not null default 'lighthouse';
alter table public.issues add column evidence jsonb not null default '{}'::jsonb;
