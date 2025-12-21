import { randomUUID } from "crypto";

export type EventLogWrite = {
  eventType: string;
  entityType: string;
  entityId: string; // uuid
  payload: unknown;
  occurredAt?: Date;
};

export async function writeEventLog(
  pg: { query: (q: string, v: any[]) => Promise<any> },
  e: EventLogWrite
) {
  const id = randomUUID();
  const occurredAt = e.occurredAt ?? new Date();

  const sql = `
    INSERT INTO event_log (id, event_type, entity_type, entity_id, payload, occurred_at)
    VALUES ($1, $2, $3, $4, $5::jsonb, $6)
  `;

  await pg.query(sql, [id, e.eventType, e.entityType, e.entityId, JSON.stringify(e.payload ?? {}), occurredAt]);
  return id;
}
