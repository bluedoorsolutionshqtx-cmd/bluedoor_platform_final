"use strict";

const db = require("../db");

function asJson(value) {
  return JSON.stringify(value ?? {});
}

function mapRow(row) {
  if (!row) return null;

  return {
    approvalId: row.decision_id,
    decisionId: row.decision_id,
    status: row.status,
    agentName: row.agent_name || null,
    actionId: row.action_id || null,
    requestedBy: row.requested_by || null,
    approvedBy: row.approved_by || null,
    deniedBy: row.denied_by || null,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

async function createApproval(data) {
  const decisionId = data.decisionId;
  const agentName = data.agentName || null;
  const actionId = data.actionId || null;
  const status = data.status || "PENDING";
  const reason = data.reason || null;
  const requestedBy = data.requestedBy || data.requested_by || "system";
  const risk = asJson(data.risk || {});
  const input = asJson(data.input || {});
  const context = asJson(data.context || {});

  const existing = await db.query(
    `
    SELECT
      decision_id,
      status,
      agent_name,
      action_id,
      requested_by,
      approved_by,
      denied_by,
      created_at,
      updated_at
    FROM approvals
    WHERE decision_id = $1
    LIMIT 1
    `,
    [decisionId]
  );

  if (existing.rows.length > 0) {
    return mapRow(existing.rows[0]);
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
      context,
      requested_by
    )
    VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8::jsonb,$9)
    RETURNING
      decision_id,
      status,
      agent_name,
      action_id,
      requested_by,
      approved_by,
      denied_by,
      created_at,
      updated_at
    `,
    [decisionId, agentName, actionId, status, reason, risk, input, context, requestedBy]
  );

  return mapRow(result.rows[0]);
}

async function updateStatus(decisionId, status, actor = null) {
  let actorColumn = null;

  if (status === "APPROVED") {
    actorColumn = "approved_by";
  } else if (status === "DENIED") {
    actorColumn = "denied_by";
  }

  const sets = ["status = $2", "updated_at = NOW()"];
  const values = [decisionId, status];
  let actorParamIndex = null;

  if (actorColumn) {
    actorParamIndex = values.length + 1;
    values.push(actor);
    sets.push(`${actorColumn} = COALESCE($${actorParamIndex}, ${actorColumn})`);
  }

  const result = await db.query(
    `
    UPDATE approvals
    SET ${sets.join(", ")}
    WHERE decision_id = $1
    RETURNING
      decision_id,
      status,
      agent_name,
      action_id,
      requested_by,
      approved_by,
      denied_by,
      created_at,
      updated_at
    `,
    values
  );

  if (result.rows.length === 0) {
    throw new Error(`Approval not found for decision_id ${decisionId}`);
  }

  return mapRow(result.rows[0]);
}

async function markApproved(decisionId, actor = "admin-api") {
  return updateStatus(decisionId, "APPROVED", actor);
}

async function markDenied(decisionId, actor = "admin-api") {
  return updateStatus(decisionId, "DENIED", actor);
}

async function approve(decisionId, actor = "admin-api") {
  return markApproved(decisionId, actor);
}

async function getApproval(decisionId) {
  const result = await db.query(
    `
    SELECT
      decision_id,
      status,
      agent_name,
      action_id,
      requested_by,
      approved_by,
      denied_by,
      created_at,
      updated_at
    FROM approvals
    WHERE decision_id = $1
    LIMIT 1
    `,
    [decisionId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapRow(result.rows[0]);
}

module.exports = {
  createApproval,
  updateStatus,
  markApproved,
  markDenied,
  approve,
  getApproval
};
