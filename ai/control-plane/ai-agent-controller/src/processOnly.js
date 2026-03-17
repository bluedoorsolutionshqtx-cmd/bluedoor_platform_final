"use strict";

const { loadContracts } = require("./contracts");
const { buildRegistry } = require("./registry");
const { processApprovals } = require("./approvalProcessor");
const routingAgent = require("./routingAgent");

async function main() {
  const contracts = loadContracts();
  const registry = buildRegistry(contracts);

  console.log("=== Processing approvals only ===");

  await processApprovals(registry, {
    "routing.publish_plan": async (req) => {
      return routingAgent.publishPlan(req.params);
    }
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
