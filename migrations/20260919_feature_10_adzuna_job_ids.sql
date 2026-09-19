alter table public.jobs
  add column if not exists external_job_id text;

create unique index if not exists jobs_user_source_external_id_unique
  on public.jobs (user_id, source, external_job_id)
  where external_job_id is not null;
