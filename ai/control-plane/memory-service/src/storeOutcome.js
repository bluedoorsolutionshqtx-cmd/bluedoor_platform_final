"use strict";

const memoryRepo = require("../../shared/repos/memoryRepo");

async function storeOutcome(payload) {
  return memoryRepo.storeOutcome({
    agentName: payload.agentName,
    actionId: payload.actionId,
    outcomeSummary: payload.outcomeSummary || null,
    input: payload.input || {},
    output: payload.output || {},
    metadata: payload.metadata || {}
  });
}

module.exports = {
  storeOutcome
};
