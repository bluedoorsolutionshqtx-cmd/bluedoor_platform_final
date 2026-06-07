import { publishEvent } from '../streams/eventPublisher.js';

export async function execute(payload) {
  const workflowId =
    payload.workflowId;

  const route = {
    workflowId,
    routeId: `route-${Date.now()}`,
    crewZone: payload.crewZone || 'default',
    generatedAt: new Date().toISOString()
  };

  console.log(
    '[routing-worker]',
    workflowId
  );

  await publishEvent(
    process.env.WORKFLOW_STREAM,
    {
      workflowId,
      workflowType:
        payload.workflowType ||
        'job-lifecycle',
      type: 'route.generated',
      route
    }
  );

  return route;
}
