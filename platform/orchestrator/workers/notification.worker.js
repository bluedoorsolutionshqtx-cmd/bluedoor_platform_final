import { publishEvent } from '../streams/eventPublisher.js';

export async function execute(payload) {
  const workflowId =
    payload.workflowId;

  const notification = {
    workflowId,
    notificationId: `notify-${Date.now()}`,
    recipient: payload.recipient || 'client',
    sentAt: new Date().toISOString()
  };

  console.log(
    '[notification-worker]',
    workflowId
  );

  await publishEvent(
    process.env.WORKFLOW_STREAM,
    {
      workflowId,
      workflowType:
        payload.workflowType ||
        'job-lifecycle',
      type: 'notification.sent',
      notification
    }
  );

  return notification;
}
