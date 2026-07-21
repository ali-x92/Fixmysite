alter table public.profiles
  add column if not exists ai_fix_credits_used integer not null default 0 check (ai_fix_credits_used >= 0),
  add column if not exists ai_fix_credits_limit integer not null default 5 check (ai_fix_credits_limit >= 0);

create or replace function public.consume_ai_fix_credit()
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  consumed boolean;
begin
  update public.profiles
  set ai_fix_credits_used = ai_fix_credits_used + 1
  where id = auth.uid() and ai_fix_credits_used < ai_fix_credits_limit
  returning true into consumed;
  return coalesce(consumed, false);
end;
$$;

grant execute on function public.consume_ai_fix_credit() to authenticated;
