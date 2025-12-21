import { writeEventLog } from "../../platform-core/src/event-log/eventLogWriter";

// Toggle with ENV. Keep default OFF.
const ENABLED = process.env.EVENT_LOG_ENABLED === "true";

/**
 * Best-effort event log emitter.
 * Never throws. Never blocks core flows.
 */
export async function emitEventLog(
  pg: { query: (q: string, v: any[]) => Promise<any> },
  input: {
    eventType: string;
    entityId: string;
    payload?: unknown;
    entityType?: string;
    occurredAt?: Date;
  }
) {
  if (!ENABLED) return;

  try {
    await writeEventLog(pg, {
      eventType: input.eventType,
      entityType: input.entityType ?? "job",
      entityId: input.entityId,
      payload: input.payload ?? {},
      occurredAt: input.occurredAt,
    });
  } catch {
    // swallow on purpose
  }
}
