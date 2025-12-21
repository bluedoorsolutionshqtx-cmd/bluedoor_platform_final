import { randomUUID } from "crypto";

export async function writeMetricAnnotation(
  pg: { query: (q: string, v: any[]) => Promise<any> },
  input: { service: string; metric: string; window: string; annotation: string; confidence?: number }
) {
  const sql = `
    INSERT INTO metric_annotations (id, service, metric, window, annotation, confidence)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
  await pg.query(sql, [randomUUID(), input.service, input.metric, input.window, input.annotation, input.confidence ?? 0.5]);
}
