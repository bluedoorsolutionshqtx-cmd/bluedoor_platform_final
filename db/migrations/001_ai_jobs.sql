CREATE TABLE IF NOT EXISTS ai_jobs (
  id           text PRIMARY KEY,
  type         text NOT NULL,
  status       text NOT NULL DEFAULT 'queued', -- queued|running|succeeded|failed|retry
  priority     integer NOT NULL DEFAULT 100,
  payload      jsonb NOT NULL DEFAULT '{}'::jsonb,
  result       jsonb,
  error        text,
  attempts     integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 3,
  run_after    timestamptz NOT NULL DEFAULT now(),
  locked_by    text,
  locked_at    timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  finished_at  timestamptz
);

CREATE INDEX IF NOT EXISTS idx_ai_jobs_pick
ON ai_jobs (status, run_after, priority, created_at);

CREATE OR REPLACE FUNCTION ai_jobs_touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

DROP TRIGGER IF EXISTS trg_ai_jobs_touch ON ai_jobs;

CREATE TRIGGER trg_ai_jobs_touch
BEFORE UPDATE ON ai_jobs
FOR EACH ROW EXECUTE FUNCTION ai_jobs_touch_updated_at();
