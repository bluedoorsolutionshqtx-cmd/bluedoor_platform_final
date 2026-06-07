import { publishEvent } from '../streams/eventPublisher.js';

export async function execute(payload) {
  const workflowId =
    payload.workflowId;

  const assignment = {
    workflowId,
    crewId: payload.crewId || 'crew-001',
    assignedAt: new Date().toISOString()
  };

  console.log(
    '[dispatch-worker]',
    workflowId
  );

  await publishEvent(
    process.env.WORKFLOW_STREAM,
    {
      workflowId,
      workflowType:
        payload.workflowType ||
        'job-lifecycle',
      type: 'crew.assigned',
      assignment
    }
  );

  return assignment;
}
