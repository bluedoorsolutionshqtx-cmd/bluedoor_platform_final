"use strict";

const { buildDiscoveredRegistry } = require("./autoDiscovery");

function buildRegistry(contracts = {}) {
  const { discovered, registry } = buildDiscoveredRegistry();

  console.log("Loaded", Object.keys(contracts).length, "agent contracts");
  console.log("Auto-discovered", discovered.length, "agents/specialists");

  return registry;
}

function getActionHandler(registry, agentName, actionId) {
  if (!registry || !agentName || !actionId) {
    return null;
  }

  const agentBucket = registry[agentName];
  if (!agentBucket) {
    return null;
  }

  return agentBucket[actionId] || null;
}

module.exports = {
  buildRegistry,
  getActionHandler
};
