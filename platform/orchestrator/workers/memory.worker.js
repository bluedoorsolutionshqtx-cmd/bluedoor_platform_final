import { publishEvent } from '../streams/eventPublisher.js';

export async function execute(payload) {
  const workflowId =
    payload.workflowId;

  console.log(
    '[memory-worker]',
    workflowId
  );

  await publishEvent(
    process.env.WORKFLOW_STREAM,
    {
      workflowId,
      workflowType:
        payload.workflowType ||
        'job-lifecycle',
      type: 'memory.stored',
      storedAt: new Date().toISOString()
    }
  );

  return true;
}
