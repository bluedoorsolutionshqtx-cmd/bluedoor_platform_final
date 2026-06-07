import { publishEvent } from '../streams/eventPublisher.js';

export async function execute(payload) {
  const workflowId =
    payload.workflowId;

  const invoice = {
    workflowId,
    invoiceId: `inv-${Date.now()}`,
    amount: payload.amount || 100,
    createdAt: new Date().toISOString()
  };

  console.log(
    '[billing-worker]',
    workflowId
  );

  await publishEvent(
    process.env.WORKFLOW_STREAM,
    {
      workflowId,
      workflowType:
        payload.workflowType ||
        'job-lifecycle',
      type: 'invoice.generated',
      invoice
    }
  );

  return invoice;
}
