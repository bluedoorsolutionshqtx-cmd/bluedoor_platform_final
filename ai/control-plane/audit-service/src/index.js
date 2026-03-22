"use strict";

const { subscribe } = require("../../ai-agent-controller/src/eventBus");
const auditRepo = require("../../shared/repos/auditRepo");

const AUDIT_EVENT_TYPES = [
  "action.proposed",
  "policy.decided",
  "approval.required",
  "approval.granted",
  "execution.requested",
  "execution.completed",
  "execution.failed"
];

async function storeAuditEvent(event) {
  const payload = { ...event };
  delete payload.id;
  delete payload.eventType;
  delete payload.timestamp;

  if (typeof auditRepo.recordAuditEvent !== "function") {
    throw new Error("auditRepo.recordAuditEvent is not available");
  }

  return auditRepo.recordAuditEvent({
    eventType: String(event.eventType || "").toUpperCase().replace(/\./g, "_"),
    agentName: event.agentName || null,
    actionId: event.actionId || null,
    decisionId: event.decisionId || null,
    executionId: event.executionId || null,
    payload
  });
}

async function handleEvent(event) {
  console.log(
    "AUDIT SERVICE received event =",
    JSON.stringify(
      {
        eventType: event.eventType,
        decisionId: event.decisionId || null,
        actionId: event.actionId || null,
        executionId: event.executionId || null
      },
      null,
      2
    )
  );

  await storeAuditEvent(event);

  console.log(
    `AUDIT SERVICE stored ${event.eventType} for decisionId = ${event.decisionId || "n/a"}`
  );
}

async function main() {
  console.log("Audit service starting...");

  for (const eventType of AUDIT_EVENT_TYPES) {
    await subscribe(eventType, async (event) => {
      try {
        await handleEvent(event);
      } catch (err) {
        console.error(`AUD
