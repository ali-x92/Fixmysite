alter table public.analyses
  add column if not exists ai_content jsonb,
  add column if not exists ai_generated_at timestamptz,
  add column if not exists ai_prompt_version text;

alter table public.issues
  add column if not exists ai_explanation jsonb;
