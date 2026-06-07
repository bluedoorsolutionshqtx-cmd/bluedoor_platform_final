import redis from '../db/redis/redisClient.js';
import pool from '../db/postgres/client.js';

const CHECKPOINT_STREAM =
  'workflow.checkpoints';

export async function saveCheckpoint(
  payload
) {
  await redis.xadd(
    CHECKPOINT_STREAM,
    '*',
    'event',
    JSON.stringify({
      workflowId:
        payload.workflowId,
      state:
        payload.state,
      payload,
      timestamp:
        new Date().toISOString()
    })
  );

  await pool.query(
    `
    INSERT INTO workflow_checkpoints (
      workflow_id,
      payload
    )
    VALUES ($1,$2)
    ON CONFLICT (workflow_id)
    DO UPDATE SET
      payload = EXCLUDED.payload
    `,
    [
      payload.workflowId,
      JSON.stringify(payload)
    ]
  );

  console.log(
    '[checkpoint saved]',
    payload.workflowId
  );
}
