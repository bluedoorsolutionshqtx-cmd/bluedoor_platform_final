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
  if (!event.decisionId) {
    throw new Error("approval.required missing decisionId");
  }

  return approvalsRepo.createApproval({
    decisionId: event.decisionId,
    agentName: event.agentName,
    actionId: event.actionId,
    status: "PENDING",
    reason: event.reason || "Approval required",
    risk: event.risk || {},
    input: event.input || {},
    context: event.context || {},
    requestedBy:
      event.requestedBy ||
      event.context?.requestedBy ||
      event.context?.requested_by ||
      "system"
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
      approvalId: approvalRecord?.approvalId || approvalRecord?.decisionId || null,
      status: approvalRecord?.status || "PENDING",
      reason: event.reason || "Approval required"
    }
  });

  console.log(
    "APPROVAL SERVICE recorded approval and is waiting for manual approval for decisionId =",
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
