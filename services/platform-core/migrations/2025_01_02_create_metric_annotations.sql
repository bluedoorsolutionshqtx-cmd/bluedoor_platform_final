CREATE TABLE IF NOT EXISTS metric_annotations (
  id uuid PRIMARY KEY,
  service text NOT NULL,
  metric text NOT NULL,
  window text NOT NULL,
  annotation text NOT NULL,
  confidence numeric NOT NULL DEFAULT 0.5,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_metric_annotations_time ON metric_annotations(created_at);
