import { publishEvent } from '../streams/eventPublisher.js';

export async function execute(payload) {
  const workflowId =
    payload.workflowId;

  console.log(
    '[recovery-worker]',
    workflowId
  );

  await publishEvent(
    process.env.WORKFLOW_STREAM,
    {
      workflowId,
      workflowType:
        payload.workflowType ||
        'job-lifecycle',
      type: 'checkpoint.saved',
      recoveredAt: new Date().toISOString()
    }
  );

  return true;
}
