create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text not null,
  phone text,
  location text,
  current_title text,
  experience_level text,
  years_experience integer,
  skills text[] not null default '{}',
  industries text[] not null default '{}',
  work_experience jsonb not null default '[]'::jsonb,
  education jsonb not null default '{}'::jsonb,
  job_titles_seeking text[] not null default '{}',
  remote_preference text,
  preferred_locations text[] not null default '{}',
  salary_expectation text,
  cover_letter_tone text,
  linkedin_url text,
  portfolio_url text,
  work_authorization text,
  resume_pdf_key text,
  is_complete boolean not null default false,
  completion_percentage integer not null default 0,
  missing_fields text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_experience_level_check
    check (experience_level is null or experience_level in ('junior', 'mid', 'senior', 'lead')),
  constraint profiles_years_experience_check
    check (years_experience is null or years_experience >= 0),
  constraint profiles_remote_preference_check
    check (remote_preference is null or remote_preference in ('remote', 'onsite', 'hybrid', 'any')),
  constraint profiles_cover_letter_tone_check
    check (cover_letter_tone is null or cover_letter_tone in ('formal', 'casual', 'enthusiastic')),
  constraint profiles_work_authorization_check
    check (work_authorization is null or work_authorization in ('citizen', 'permanent_resident', 'visa_required')),
  constraint profiles_completion_percentage_check
    check (completion_percentage between 0 and 100),
  constraint profiles_work_experience_array_check
    check (jsonb_typeof(work_experience) = 'array' and jsonb_array_length(work_experience) <= 3),
  constraint profiles_education_object_check
    check (jsonb_typeof(education) = 'object')
);

create table public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'running',
  job_title_searched text not null,
  location_searched text,
  jobs_found integer not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint agent_runs_status_check
    check (status in ('running', 'completed', 'failed')),
  constraint agent_runs_jobs_found_check
    check (jobs_found >= 0),
  constraint agent_runs_completion_check
    check (
      (status = 'running' and completed_at is null)
      or (status in ('completed', 'failed') and completed_at is not null)
    ),
  constraint agent_runs_id_user_unique unique (id, user_id)
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid,
  user_id uuid not null references public.profiles (id) on delete cascade,
  source text not null default 'search',
  source_url text not null,
  external_apply_url text not null,
  title text not null,
  company text not null,
  location text,
  salary text,
  job_type text,
  about_role text,
  responsibilities text[] not null default '{}',
  requirements text[] not null default '{}',
  nice_to_have text[] not null default '{}',
  benefits text[] not null default '{}',
  about_company text,
  match_score integer not null,
  match_reason text not null,
  matched_skills text[] not null default '{}',
  missing_skills text[] not null default '{}',
  company_research jsonb,
  found_at timestamptz not null default now(),
  constraint jobs_source_check
    check (source in ('search', 'url')),
  constraint jobs_job_type_check
    check (job_type is null or job_type in ('fulltime', 'parttime', 'contract')),
  constraint jobs_match_score_check
    check (match_score between 0 and 100),
  constraint jobs_company_research_object_check
    check (company_research is null or jsonb_typeof(company_research) = 'object'),
  constraint jobs_run_owner_fk
    foreign key (run_id, user_id)
    references public.agent_runs (id, user_id)
    on delete cascade,
  constraint jobs_id_user_unique unique (id, user_id)
);

create table public.agent_logs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  message text not null,
  level text not null default 'info',
  job_id uuid,
  created_at timestamptz not null default now(),
  constraint agent_logs_level_check
    check (level in ('info', 'success', 'warning', 'error')),
  constraint agent_logs_run_owner_fk
    foreign key (run_id, user_id)
    references public.agent_runs (id, user_id)
    on delete cascade,
  constraint agent_logs_job_owner_fk
    foreign key (job_id, user_id)
    references public.jobs (id, user_id)
    on delete cascade
);

create index agent_runs_user_started_idx
  on public.agent_runs (user_id, started_at desc);
create index jobs_user_found_idx
  on public.jobs (user_id, found_at desc);
create index jobs_user_match_idx
  on public.jobs (user_id, match_score desc);
create index jobs_run_idx
  on public.jobs (run_id);
create index agent_logs_user_created_idx
  on public.agent_logs (user_id, created_at desc);
create index agent_logs_run_created_idx
  on public.agent_logs (run_id, created_at);
create index agent_logs_job_idx
  on public.agent_logs (job_id)
  where job_id is not null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.agent_runs enable row level security;
alter table public.jobs enable row level security;
alter table public.agent_logs enable row level security;

create policy profiles_owner_all
  on public.profiles
  for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy agent_runs_owner_all
  on public.agent_runs
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy jobs_owner_all
  on public.jobs
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy agent_logs_owner_all
  on public.agent_logs
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.agent_runs to authenticated;
grant select, insert, update, delete on public.jobs to authenticated;
grant select, insert, update, delete on public.agent_logs to authenticated;

revoke all on public.profiles from anon;
revoke all on public.agent_runs from anon;
revoke all on public.jobs from anon;
revoke all on public.agent_logs from anon;

-- InsForge Storage uses the bucket name separately from the object key. The
-- single active resume therefore lives at: resumes/{user_id}/resume.pdf.
insert into storage.buckets (name, public)
values ('resumes', false)
on conflict (name) do update
set public = false,
    updated_at = now();

alter table storage.objects enable row level security;

create policy resumes_owner_select
  on storage.objects
  for select
  to authenticated
  using (
    bucket = 'resumes'
    and key = auth.uid()::text || '/resume.pdf'
  );

create policy resumes_owner_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket = 'resumes'
    and key = auth.uid()::text || '/resume.pdf'
    and mime_type = 'application/pdf'
  );

create policy resumes_owner_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket = 'resumes'
    and key = auth.uid()::text || '/resume.pdf'
  )
  with check (
    bucket = 'resumes'
    and key = auth.uid()::text || '/resume.pdf'
    and mime_type = 'application/pdf'
  );

create policy resumes_owner_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket = 'resumes'
    and key = auth.uid()::text || '/resume.pdf'
  );
