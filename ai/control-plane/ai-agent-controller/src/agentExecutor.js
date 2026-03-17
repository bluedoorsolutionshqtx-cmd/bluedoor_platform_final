const { executeWithAuthorization } = require("./executeWithAuthorization");

async function executeAgentAction(contracts, request, handler) {
  return executeWithAuthorization(
    contracts,
    request,
    handler,
    { dryRun: false }
  );
}

module.exports = { executeAgentAction };
