"use strict";

const eventBus = require("../../ai-agent-controller/src/eventBus");
const approvalsRepo = require("../../shared/repos/approvalsRepo");
const auditRepo = require("../../shared/repos/auditRepo");

async function safeAudit(event) {
  try {
    await auditRepo.recordAuditEvent(event);
  } catch (err) {
    console.error("Approval service audit write failed:", err.message);
  }
}

async function storeApprovalRequest(event) {
  const payload = event.payload || {};

  if (!event.decisionId) {
    throw new Error("approval.required missing decisionId");
  }

  const approvalRecord = {
    decisionId: event.decisionId,
    agentName: event.agentName,
    actionId: event.actionId,
    status: "PENDING",
    reason:
      payload.reason ||
      payload.policy?.reason ||
      "Approval required",
    risk: payload.risk || null,
    input: payload.input || {},
    context: payload.context || {}
  };

  if (typeof approvalsRepo.createApproval === "function") {
    return approvalsRepo.createApproval(approvalRecord);
  }

  if (typeof approvalsRepo.create === "function") {
    return approvalsRepo.create(approvalRecord);
  }

  if (typeof approvalsRepo.saveApproval === "function") {
    return approvalsRepo.saveApproval(approvalRecord);
  }

  console.warn(
    "approvalsRepo has no createApproval/create/saveApproval function; using in-memory approval object"
  );

  return {
    approval_id: `apr_${event.decisionId}`,
    ...approvalRecord
  };
}

async function markApproved(approvalRecord) {
  const approvalId =
    approvalRecord?.approval_id ||
    approvalRecord?.approvalId ||
    approvalRecord?.id ||
    null;

  if (!approvalId) {
    return approvalRecord;
  }

  if (typeof approvalsRepo.markApproved === "function") {
    return approvalsRepo.markApproved(approvalId);
  }

  if (typeof approvalsRepo.approve === "function") {
    return approvalsRepo.approve(approvalId);
  }

  if (typeof approvalsRepo.updateStatus === "function") {
    return approvalsRepo.updateStatus(approvalId, "APPROVED");
  }

  return {
    ...approvalRecord,
    status: "APPROVED"
  };
}

async function emitApprovalGranted(event, approvalRecord) {
  const payload = event.payload || {};

  await eventBus.emitEvent("approval.granted", {
    decisionId: event.decisionId,
    approvalId:
      approvalRecord?.approval_id ||
      approvalRecord?.approvalId ||
      approvalRecord?.id ||
      null,
    agentName: event.agentName,
    actionId: event.actionId,
    input: payload.input || {},
    context: payload.context || {},
    reason:
      payload.reason ||
      payload.policy?.reason ||
      "Approval granted"
  });
}

async function emitExecutionRequested(event) {
  const payload = event.payload || {};

  await eventBus.emitEvent("execution.requested", {
    decisionId: event.decisionId,
    agentName: event.agentName,
    actionId: event.actionId,
    input: payload.input || {},
    context: payload.context || {}
  });
}

async function handleApprovalRequired(event) {
  console.log(
    "APPROVAL SERVICE received approval.required =",
    JSON.stringify(event, null, 2)
  );

  const approvalRecord = await storeApprovalRequest(event);

  await safeAudit({
    eventType: "APPROVAL_RECORDED",
    agentName: event.agentName,
    actionId: event.actionId,
    decisionId: event.decisionId,
    payload: {
      approvalId:
        approvalRecord?.approval_id ||
        approvalRecord?.approvalId ||
        approvalRecord?.id ||
        null,
      status: approvalRecord?.status || "PENDING",
      reason: approvalRecord?.reason || null
    }
  });

  const approvedRecord = await markApproved(approvalRecord);

  await safeAudit({
    eventType: "APPROVAL_GRANTED",
    agentName: event.agentName,
    actionId: event.actionId,
    decisionId: event.decisionId,
    payload: {
      approvalId:
        approvedRecord?.approval_id ||
        approvedRecord?.approvalId ||
        approvedRecord?.id ||
        null,
      status: approvedRecord?.status || "APPROVED"
    }
  });

  await emitApprovalGranted(event, approvedRecord);
  await emitExecutionRequested(event);

  console.log(
    "APPROVAL SERVICE granted approval and emitted execution.requested for decisionId =",
    event.decisionId
  );
}

async function main() {
  console.log("Approval service starting...");

  await eventBus.subscribe("approval.required", async (event) => {
    try {
      await handleApprovalRequired(event);
    } catch (err) {
      console.error("Approval service fatal handler error:", err);

      await safeAudit({
        eventType: "APPROVAL_FAILED",
        agentName: event?.agentName || null,
        actionId: event?.actionId || null,
        decisionId: event?.decisionId || null,
        payload: {
          error: err.message
        }
      });
    }
  });
}

main().catch((err) => {
  console.error("Approval service startup failed:", err);
  process.exit(1);
});
