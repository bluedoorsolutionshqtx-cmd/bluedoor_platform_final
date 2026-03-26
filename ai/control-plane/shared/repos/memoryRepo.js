"use strict";

const crypto = require("crypto");
const db = require("../db");

function buildMemoryId() {
  return `mem_${Date.now()}_${crypto.randomUUID()}`;
}

function asJson(value) {
  return JSON.stringify(value ?? {});
}

function mapRow(row) {
  if (!row) return null;

  return {
    memoryId: row.memory_id,
    agentName: row.agent_name,
    actionId: row.action_id,
    decisionId: row.decision_id,
    executionId: row.execution_id,
    outcomeSummary: row.outcome_summary,
    created_at: row.created_at
  };
}

async function storeMemory(data) {
  const memoryId = data.memoryId || buildMemoryId();
  const agentName = data.agentName || "unknown_agent";
  const actionId = data.actionId || "unknown_action";
  const decisionId = data.decisionId || null;
  const executionId = data.executionId || null;
  const outcomeSummary = data.outcomeSummary || "No outcome summary provided";
  const input = asJson(data.input);
  const output = asJson(data.output);
  const metadata = asJson(data.metadata);

  if (executionId) {
    const existing = await db.query(
      `
      SELECT memory_id, agent_name, action_id, decision_id, execution_id, outcome_summary, created_at
      FROM agent_memory
      WHERE execution_id = $1
      LIMIT 1
      `,
      [executionId]
    );

    if (existing.rows.length > 0) {
      return mapRow(existing.rows[0]);
    }
  }

  const inserted = await db.query(
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
    RETURNING memory_id, agent_name, action_id, decision_id, execution_id, outcome_summary, created_at
    `,
    [
      memoryId,
      agentName,
      actionId,
      decisionId,
      executionId,
      outcomeSummary,
      input,
      output,
      metadata
    ]
  );

  return mapRow(inserted.rows[0]);
}

async function getRecentMemory(agentName = null, limit = 20) {
  const result = await db.query(
    `
    SELECT memory_id, agent_name, action_id, decision_id, execution_id, outcome_summary, created_at
    FROM agent_memory
    WHERE ($1::text IS NULL OR agent_name = $1)
    ORDER BY created_at DESC
    LIMIT $2
    `,
    [agentName, Number(limit)]
  );

  return result.rows.map(mapRow);
}

module.exports = {
  buildMemoryId,
  storeMemory,
  storeOutcome: storeMemory,
  getRecentMemory
};
