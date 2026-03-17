"use strict";

const { loadContracts } = require("./contracts");
const { buildRegistry, getActionHandler } = require("./registry");
const executeWithAuthorization = require("./executeWithAuthorization");
const eventBus = require("./eventBus");

async function main() {
  eventBus.subscribe("*", async (event) => {
    console.log("EVENT =", event.eventType || event.event_type);
  });

  const raw = process.argv[2];

  if (!raw) {
    console.log("Usage: node src/index.js '<json>'");
    process.exit(1);
  }

  const request = JSON.parse(raw);

  console.log("DEBUG index.js request =", JSON.stringify(request, null, 2));

  const contracts = loadContracts();
  const registry = buildRegistry(contracts);

  console.log("Loaded", Object.keys(contracts).length, "agent contracts");
  console.log("Loaded", Object.keys(registry).length, "registered agents/specialists");

  const handler = getActionHandler(
    registry,
    request.agentName,
    request.actionId
  );

  if (!handler) {
    console.error(`No handler found for ${request.agentName}:${request.actionId}`);
    process.exit(1);
  }

  const result = await executeWithAuthorization({
    agentName: request.agentName,
    actionId: request.actionId,
    params: request.params,
    context: request.context,
    confidence: request.confidence
  });

  console.log("Result =", JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
