import redis from '../streams/redisClient.js';

const AUDIT_STREAM =
  'workflow.audit';

export async function saveAuditEvent(
  payload
) {
  await redis.xadd(
    AUDIT_STREAM,
    '*',
    'event',
    JSON.stringify({
      ...payload,
      auditedAt:
        new Date()
          .toISOString()
    })
  );

  console.log(
    '[audit logged]',
    payload.type
  );
}
