"use strict";

const { loadContracts } = require("../../ai-agent-controller/src/contracts");

function discoverAgents() {
  return loadContracts();
}

module.exports = {
  discoverAgents
};
