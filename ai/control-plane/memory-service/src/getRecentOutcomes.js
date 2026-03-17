"use strict";

const db = require("../../shared/db");

async function getRecentOutcomes(agentName, actionId, limit = 10) {
  const sql = `
    SELECT *
    FROM agent_memory
    WHERE agent_name = $1
      AND action_id = $2
    ORDER BY created_at DESC
    LIMIT $3;
  `;

  const result = await db.query(sql, [agentName, actionId, limit]);
  return result.rows;
}

module.exports = {
  getRecentOutcomes
};
