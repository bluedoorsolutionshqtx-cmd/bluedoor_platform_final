import redis from '../db/redis/redisClient.js';

import {
  retryEvent
} from '../streams/retryQueue.js';

import {
  sendToDeadLetter
} from '../streams/deadletter.js';

import {
  saveAuditEvent
} from '../audit/auditLogger.js';

import {
  storeMemory
} from '../memory/memoryStore.js';

import {
  evaluatePolicy
} from '../governance/policy/policyEngine.js';

import {
  createApproval
} from '../governance/approval/approvalManager.js';

const workerMap = {
  'lead.created': 'dispatch.worker',
  'client.created': 'dispatch.worker',
  'property.registered': 'routing.worker',
  'job.scheduled': 'routing.worker',
  'route.generated': 'routing.worker',
  'crew.assigned': 'dispatch.worker',
  'job.approved': 'dispatch.worker',
  'crew.dispatched': 'dispatch.worker',
  'crew.arrived': 'dispatch.worker',
  'job.started': 'dispatch.worker',
  'job.completed': 'billing.worker',
  'invoice.generated': 'billing.worker',
  'payment.recorded': 'billing.worker',
  'audit.logged': 'audit.worker',
  'memory.stored': 'memory.worker',
  'checkpoint.saved': 'recovery.worker',
  'payment.refund': 'billing.worker'
};

export async function dispatchEvent(payload) {
  const worker =
    workerMap[payload.type];

  if (!worker) {
    await sendToDeadLetter(
      payload,
      'missing worker mapping'
    );

    return;
  }

  const policy =
    await evaluatePolicy(payload);

  if (policy?.approvalRequired) {
    await createApproval(
      payload,
      policy.risk
    );

    console.log(
      '[policy blocked]',
      payload.type
    );

    return;
  }

  try {
    await redis.xadd(
      `worker.${worker}`,
      '*',
      'event',
      JSON.stringify(payload)
    );

    await saveAuditEvent({
      workflowId:
        payload.workflowId,
      eventType:
        payload.type,
      payload
    });

    await storeMemory({
      workflowId:
        payload.workflowId,
      workflowType:
        payload.workflowType,
      type:
        payload.type
    });

    console.log(
      '[dispatcher]',
      payload.type,
      '→',
      worker
    );

  } catch (err) {

    console.error(
      '[dispatcher failure]',
      err.message
    );

    await retryEvent(
      payload,
      err.message
    );
  }
}
