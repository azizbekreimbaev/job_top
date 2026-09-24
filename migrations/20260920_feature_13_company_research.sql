-- Company research is job-scoped and must not create a misleading discovery run.
ALTER TABLE public.agent_logs
  ALTER COLUMN run_id DROP NOT NULL;
