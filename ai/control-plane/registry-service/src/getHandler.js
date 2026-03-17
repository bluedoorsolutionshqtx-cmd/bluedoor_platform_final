"use strict";

const { getRegistry } = require("./index");
const { getActionHandler } = require("../../ai-agent-controller/src/registry");

function resolveHandler(agentName, actionId) {
  const registry = getRegistry();

  return getActionHandler(
    registry,
    agentName,
    actionId
  );
}

module.exports = {
  resolveHandler
};
