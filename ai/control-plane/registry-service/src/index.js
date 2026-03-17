"use strict";

const { loadContracts } = require("../../ai-agent-controller/src/contracts");
const { buildRegistry } = require("../../ai-agent-controller/src/registry");

let registry = null;

function initializeRegistry() {
  const contracts = loadContracts();
  registry = buildRegistry(contracts);
}

function getRegistry() {
  if (!registry) {
    initializeRegistry();
  }
  return registry;
}

module.exports = {
  getRegistry
};
