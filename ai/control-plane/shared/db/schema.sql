CREATE TABLE IF NOT EXISTS approvals (
  id BIGSERIAL PRIMARY KEY,
  decision_id TEXT NOT NULL UNIQUE,
  agent_name TEXT NOT NULL,
  action_id TEXT NOT NULL,
  status TEXT NOT NULL,
  requested_by TEXT,
  approved_by TEXT,
  denied_by TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  risk JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS executions (
  id BIGSERIAL PRIMARY KEY,
  execution_id TEXT NOT NULL UNIQUE,
  decision_id TEXT,
  agent_name TEXT NOT NULL,
  action_id TEXT NOT NULL,
  status TEXT NOT NULL,
  input JSONB NOT NULL DEFAULT '{}'::jsonb,
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  error JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_events (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  agent_name TEXT,
  action_id TEXT,
  decision_id TEXT,
  execution_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_memory (
  id BIGSERIAL PRIMARY KEY,
  agent_name TEXT NOT NULL,
  action_id TEXT NOT NULL,
  outcome_summary TEXT,
  input JSONB NOT NULL DEFAULT '{}'::jsonb,
  output JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approvals_decision_id
  ON approvals(decision_id);

CREATE INDEX IF NOT EXISTS idx_executions_decision_id
  ON executions(decision_id);

CREATE INDEX IF NOT EXISTS idx_audit_events_decision_id
  ON audit_events(decision_id);

CREATE INDEX IF NOT EXISTS idx_agent_memory_agent_action
  ON agent_memory(agent_name, action_id);
