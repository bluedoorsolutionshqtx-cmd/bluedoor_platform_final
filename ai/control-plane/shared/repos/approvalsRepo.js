"use strict";

const db = require("../db");

async function createApproval(data) {
  const decisionId = data.decisionId;
  const agentName = data.agentName || null;
  const actionId = data.actionId || null;
  const status = data.status || "PENDING";
  const reason = data.reason || null;
  const risk = JSON.stringify(data.risk || {});
  const input = JSON.stringify(data.input || {});
  const context = JSON.stringify(data.context || {});

  const existing = await db.query(
    `
    SELECT decision_id, status, created_at
    FROM approvals
    WHERE decision_id = $1
    LIMIT 1
    `,
    [decisionId]
  );

  if (existing.rows.length > 0) {
    return {
      approvalId: existing.rows[0].decision_id,
      decisionId: existing.rows[0].decision_id,
      status: existing.rows[0].status,
      created_at: existing.rows[0].created_at
    };
  }

  const result = await db.query(
    `
    INSERT INTO approvals (
      decision_id,
      agent_name,
      action_id,
      status,
      reason,
      risk,
      input,
      context
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING decision_id, status, created_at
    `,
    [decisionId, agentName, actionId, status, reason, risk, input, context]
  );

  return {
    approvalId: result.rows[0].decision_id,
    decisionId: result.rows[0].decision_id,
    status: result.rows[0].status,
    created_at: result.rows[0].created_at
  };
}

async function updateStatus(decisionId, status) {
  const result = await db.query(
    `
    UPDATE approvals
    SET status = $2
    WHERE decision_id = $1
    RETURNING decision_id, status, created_at
    `,
    [decisionId, status]
  );

  if (result.rows.length === 0) {
    throw new Error(`Approval not found for decision_id ${decisionId}`);
  }

  return {
    approvalId: result.rows[0].decision_id,
    decisionId: result.rows[0].decision_id,
    status: result.rows[0].status,
    created_at: result.rows[0].created_at
  };
}

async function markApproved(decisionId) {
  return updateStatus(decisionId, "APPROVED");
}

async function approve(decisionId) {
  return markApproved(decisionId);
}

async function getApproval(decisionId) {
  const result = await db.query(
    `
    SELECT decision_id, status, created_at
    FROM approvals
    WHERE decision_id = $1
    LIMIT 1
    `,
    [decisionId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return {
    approvalId: result.rows[0].decision_id,
    decisionId: result.rows[0].decision_id,
    status: result.rows[0].status,
    created_at: result.rows[0].created_at
  };
}

module.exports = {
  createApproval,
  updateStatus,
  markApproved,
  approve,
  getApproval
};
