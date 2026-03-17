"use strict";

const {
  buildRegistry,
  getActionHandler
} = require("../../ai-agent-controller/src/registry");

async function executeAction(payload) {
  console.log("DEBUG execution-service payload =", JSON.stringify(payload, null, 2));

  const {
    agentName,
    actionId,
    input = {},
    context = {}
  } = payload || {};

  if (!agentName || !actionId) {
    throw new Error(`No handler found for ${agentName}:${actionId}`);
  }

  const registry = buildRegistry();
  const handler = getActionHandler(registry, agentName, actionId);

  if (!handler) {
    throw new Error(`No handler found for ${agentName}:${actionId}`);
  }

  const result = await handler(input, context);

  return {
    status: "EXECUTED",
    result
  };
}

module.exports = executeAction;
