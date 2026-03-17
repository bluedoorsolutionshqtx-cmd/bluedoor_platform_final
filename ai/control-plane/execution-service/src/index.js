"use strict";

const path = require("path");

const { loadContracts } = require("../../ai-agent-controller/src/contracts");
const {
  buildRegistry,
  getActionHandler
} = require("../../ai-agent-controller/src/registry");

function buildExecutionRegistry() {
  const contracts = loadContracts();
  return buildRegistry(contracts);
}

async function executeAction(action) {
  if (!action) {
    throw new Error("Missing action");
  }

  if (!action.agentName) {
    throw new Error("Missing agentName");
  }

  if (!action.actionId) {
    throw new Error("Missing actionId");
  }

  const registry = buildExecutionRegistry();

  const handler = getActionHandler(
    registry,
    action.agentName,
    action.actionId
  );

  if (typeof handler !== "function") {
    throw new Error(
      `No handler found for ${action.agentName}:${action.actionId}`
    );
  }

  const result = await handler(action.input || {});

  return {
    status: "EXECUTED",
    result
  };
}

module.exports = {
  executeAction
};
