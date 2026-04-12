"use strict";

const crypto = require("crypto");
const db = require("../db");

function buildMemoryId() {
  return `mem_${Date.now()}_${crypto.randomUUID()}`;
}

function asJson(value) {
  return JSON.stringify(value ?? {});
}

async function storeOutcome(outcome) {
  const memoryId = outcome.memoryId || buildMemoryId();

  const result = await db.query(
    `
    INSERT INTO agent_memory (
      memory_id,
      agent_name,
      action_id,
      decision_id,
      execution_id,
      outcome_summary,
      input,
      output,
      metadata
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9::jsonb)
    RETURNING
      memory_id,
      agent_name,
      action_id,
      decision_id,
      execution_id,
      outcome_summary,
      created_at
    `,
    [
      memoryId,
      outcome.agentName || null,
      outcome.actionId || null,
      outcome.decisionId || null,
      outcome.executionId || null,
      outcome.outcomeSummary || null,
      asJson(outcome.input || {}),
      asJson(outcome.output || {}),
      asJson(outcome.metadata || {})
    ]
  );

  return {
    memory_id: result.rows[0].memory_id,
    stored: true,
    storage: "postgres",
    created_at: result.rows[0].created_at
  };
}

async function getRecentOutcomes(limit = 20) {
  const result = await db.query(
    `
    SELECT
      memory_id,
      agent_name,
      action_id,
      decision_id,
      execution_id,
      outcome_summary,
      input,
      output,
      metadata,
      created_at
    FROM agent_memory
    ORDER BY created_at DESC
    LIMIT $1
    `,
    [limit]
  );

  return result.rows;
}

module.exports = {
  storeOutcome,
  getRecentOutcomes
};
