"use strict";

async function storeOutcome(outcome) {
  console.log("Memory outcome stored (dev mode):");
  console.log(JSON.stringify(outcome, null, 2));

  return {
    memory_id: outcome.decisionId || `mem_${Date.now()}`,
    stored: true,
    storage: "dev-memory"
  };
}

async function getRecentOutcomes() {
  return [];
}

module.exports = {
  storeOutcome,
  getRecentOutcomes
};
