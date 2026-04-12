"use strict";

const memoryRepo = require("../../shared/repos/memoryRepo");

async function storeOutcome(payload) {
  return memoryRepo.storeOutcome({
    agentName: payload.agentName,
    actionId: payload.actionId,
    decisionId: payload.decisionId || null,
    executionId: payload.executionId || null,
    outcomeSummary: payload.outcomeSummary || null,
    input: payload.input || {},
    output: payload.output || {},
    metadata: payload.metadata || {}
  });
}

module.exports = {
  storeOutcome
};
