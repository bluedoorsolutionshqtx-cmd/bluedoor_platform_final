"use strict";

const crypto = require("crypto");
const db = require("../db");

function buildExecutionId() {
  return `exe_${Date.now()}_${crypto.randomUUID()}`;
}

function asJson(value) {
  return JSON.stringify(value ?? {});
}

function mapRow(row) {
  if (!row) return null;

  return {
    executionId: row.execution_id,
    decisionId: row.decision_id,
    agentName: row.agent_name || null,
    actionId: row.action_id || null,
    status: row.status,
    created_at: row.created_at
  };
}

async function getExecutionByDecisionId(decisionId) {
  if (!decisionId) return null;

  const result = await db.query(
    `
    SELECT execution_id, decision_id, agent_name, action_id, status, created_at
    FROM executions
    WHERE decision_id = $1
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [decisionId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapRow(result.rows[0]);
}

async function createExecution(data) {
  const decisionId = data.decisionId || null;

  if (decisionId) {
    const existingByDecision = await getExecutionByDecisionId(decisionId);
    if (existingByDecision) {
      return existingByDecision;
    }
  }

  const executionId = data.executionId || buildExecutionId();
  const agentName = data.agentName || null;
  const actionId = data.actionId || null;
  const status = data.status || "REQUESTED";
  const input = asJson(data.input);
  const result = asJson(data.result);
  const error = asJson(data.error);

  const existing = await db.query(
    `
    SELECT execution_id, decision_id, agent_name, action_id, status, created_at
    FROM executions
    WHERE execution_id = $1
    LIMIT 1
    `,
    [executionId]
  );

  if (existing.rows.length > 0) {
    return mapRow(existing.rows[0]);
  }

  const inserted = await db.query(
    `
    INSERT INTO executions (
      execution_id,
      decision_id,
      agent_name,
      action_id,
      status,
      input,
      result,
      error
    )
    VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8::jsonb)
    RETURNING execution_id, decision_id, agent_name, action_id, status, created_at
    `,
    [executionId, decisionId, agentName, actionId, status, input, result, error]
  );

  return mapRow(inserted.rows[0]);
}

async function updateExecution(executionId, data) {
  const current = await db.query(
    `
    SELECT execution_id, decision_id, agent_name, action_id, status, created_at
    FROM executions
    WHERE execution_id = $1
    LIMIT 1
    `,
    [executionId]
  );

  if (current.rows.length === 0) {
    throw new Error(`Execution not found for execution_id ${executionId}`);
  }

  const sets = [];
  const values = [];
  let i = 1;

  if (Object.prototype.hasOwnProperty.call(data, "status")) {
    sets.push(`status = $${i++}`);
    values.push(data.status);
  }

  if (Object.prototype.hasOwnProperty.call(data, "result")) {
    sets.push(`result = $${i++}::jsonb`);
    values.push(asJson(data.result));
  }

  if (Object.prototype.hasOwnProperty.call(data, "error")) {
    sets.push(`error = $${i++}::jsonb`);
    values.push(asJson(data.error));
  }

  if (sets.length === 0) {
    return mapRow(current.rows[0]);
  }

  values.push(executionId);

  const updated = await db.query(
    `
    UPDATE executions
    SET ${sets.join(", ")}
    WHERE execution_id = $${i}
    RETURNING execution_id, decision_id, agent_name, action_id, status, created_at
    `,
    values
  );

  return mapRow(updated.rows[0]);
}

async function markExecuted(executionId, result) {
  return updateExecution(executionId, {
    status: "EXECUTED",
    result: result ?? {},
    error: {}
  });
}

async function markFailed(executionId, error) {
  return updateExecution(executionId, {
    status: "FAILED",
    result: {},
    error: error ?? {}
  });
}

module.exports = {
  buildExecutionId,
  getExecutionByDecisionId,
  createExecution,
  updateExecution,
  markExecuted,
  markFailed
};
