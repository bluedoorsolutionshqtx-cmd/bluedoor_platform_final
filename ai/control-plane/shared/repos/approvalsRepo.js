"use strict";

const db = require("../db");

async function createApproval(record) {
  const sql = `
    INSERT INTO approvals
      (decision_id, agent_name, action_id, status, requested_by, payload, risk)
    VALUES
      ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb)
    ON CONFLICT (decision_id)
    DO UPDATE SET
      status = EXCLUDED.status,
      payload = EXCLUDED.payload,
      risk = EXCLUDED.risk,
      updated_at = NOW()
    RETURNING *;
  `;

  const values = [
    record.decisionId,
    record.agentName,
    record.actionId,
    record.status,
    record.requestedBy || null,
    JSON.stringify(record.payload || {}),
    JSON.stringify(record.risk || {})
  ];

  const result = await db.query(sql, values);
  return result.rows[0];
}

async function markApproved(decisionId, approvedBy) {
  const sql = `
    UPDATE approvals
    SET status = 'APPROVED',
        approved_by = $2,
        updated_at = NOW()
    WHERE decision_id = $1
    RETURNING *;
  `;
  const result = await db.query(sql, [decisionId, approvedBy]);
  return result.rows[0];
}

async function markDenied(decisionId, deniedBy) {
  const sql = `
    UPDATE approvals
    SET status = 'DENIED',
        denied_by = $2,
        updated_at = NOW()
    WHERE decision_id = $1
    RETURNING *;
  `;
  const result = await db.query(sql, [decisionId, deniedBy]);
  return result.rows[0];
}

async function listPending() {
  const sql = `
    SELECT *
    FROM approvals
    WHERE status = 'PENDING_APPROVAL'
    ORDER BY created_at ASC;
  `;
  const result = await db.query(sql);
  return result.rows;
}

module.exports = {
  createApproval,
  markApproved,
  markDenied,
  listPending
};
