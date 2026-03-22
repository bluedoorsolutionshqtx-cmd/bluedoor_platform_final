"use strict";

const db = require("../db");

async function recordAuditEvent(event) {
  await db.query(
    `
    INSERT INTO audit_events (
      event_type,
      agent_name,
      action_id,
      decision_id,
      execution_id,
      payload
    )
    VALUES ($1,$2,$3,$4,$5,$6)
    `,
    [
      event.eventType,
      event.agentName,
      event.actionId,
      event.decisionId,
      event.executionId || null,
      JSON.stringify(event.payload || {})
    ]
  );
}

module.exports = { recordAuditEvent };
