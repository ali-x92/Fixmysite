create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.sites enable row level security;
alter table public.analyses enable row level security;
alter table public.issues enable row level security;
alter table public.recommendations enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "sites_own" on public.sites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "analyses_own" on public.analyses for all using (
  exists (select 1 from public.sites where sites.id = analyses.site_id and sites.user_id = auth.uid())
) with check (
  exists (select 1 from public.sites where sites.id = analyses.site_id and sites.user_id = auth.uid())
);

create policy "issues_own" on public.issues for all using (
  exists (
    select 1 from public.analyses
    join public.sites on sites.id = analyses.site_id
    where analyses.id = issues.analysis_id and sites.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.analyses
    join public.sites on sites.id = analyses.site_id
    where analyses.id = issues.analysis_id and sites.user_id = auth.uid()
  )
);

create policy "recommendations_own" on public.recommendations for all using (
  exists (
    select 1 from public.analyses
    join public.sites on sites.id = analyses.site_id
    where analyses.id = recommendations.analysis_id and sites.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.analyses
    join public.sites on sites.id = analyses.site_id
    where analyses.id = recommendations.analysis_id and sites.user_id = auth.uid()
  )
);
