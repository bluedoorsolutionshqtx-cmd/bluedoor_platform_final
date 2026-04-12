"use strict";

const { loadContracts } = require("../../ai-agent-controller/src/contracts");
const {
  buildRegistry,
  getActionHandler
} = require("../../ai-agent-controller/src/registry");
const eventBus = require("../../ai-agent-controller/src/eventBus");
const auditRepo = require("../../shared/repos/auditRepo");
const executionsRepo = require("../../shared/repos/executionsRepo");
const { storeOutcome } = require("../../memory-service/src");

function buildExecutionRegistry() {
  const contracts = loadContracts();
  return buildRegistry(contracts);
}

async function safeAudit(event) {
  try {
    await auditRepo.recordAuditEvent(event);
  } catch (err) {
    console.error("Execution audit write failed:", err.message);
  }
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

async function handleExecutionRequested(event) {
  const decisionId = event.decisionId || null;
  const agentName = event.agentName;
  const actionId = event.actionId;
  const input = event.input || {};
  const context = event.context || {};

  if (!agentName || !actionId) {
    throw new Error("execution.requested missing agentName or actionId");
  }

  let existing = decisionId
    ? await executionsRepo.getExecutionByDecisionId(decisionId)
    : null;

  if (existing && (existing.status === "RUNNING" || existing.status === "EXECUTED")) {
    console.log(
      `Execution already ${existing.status} for decisionId=${decisionId}, skipping duplicate event`
    );
    return existing;
  }

  let execution =
    existing ||
    await executionsRepo.createExecution({
      decisionId,
      agentName,
      actionId,
      status: "REQUESTED",
      input,
      result: {},
      error: {}
    });

  execution = await executionsRepo.updateExecution(execution.executionId, {
    status: "RUNNING"
  });

  await safeAudit({
    eventType: "EXECUTION_STARTED",
    agentName,
    actionId,
    decisionId,
    executionId: execution.executionId,
    payload: {
      input,
      context
    }
  });

  try {
    const outcome = await executeAction({
      agentName,
      actionId,
      input,
      context
    });

    execution = await executionsRepo.markExecuted(
      execution.executionId,
      outcome.result
    );

    await safeAudit({
      eventType: "EXECUTION_EXECUTED",
      agentName,
      actionId,
      decisionId,
      executionId: execution.executionId,
      payload: {
        input,
        context,
        result: outcome.result
      }
    });

    await eventBus.emitEvent("execution.completed", {
      decisionId,
      executionId: execution.executionId,
      agentName,
      actionId,
      input,
      context,
      output: outcome.result
    });

    await storeOutcome({
      agentName,
      actionId,
      decisionId,
      executionId: execution.executionId,
      outcomeSummary: "Execution succeeded",
      input,
      output: outcome.result,
      metadata: {
        status: "EXECUTED",
        context
      }
    });

    return execution;
  } catch (err) {
    execution = await executionsRepo.markFailed(
      execution.executionId,
      {
        message: err.message
      }
    );

    await safeAudit({
      eventType: "EXECUTION_FAILED",
      agentName,
      actionId,
      decisionId,
      executionId: execution.executionId,
      payload: {
        input,
        context,
        error: {
          message: err.message
        }
      }
    });

    await eventBus.emitEvent("execution.failed", {
      decisionId,
      executionId: execution.executionId,
      agentName,
      actionId,
      input,
      context,
      error: {
        message: err.message
      }
    });

    await storeOutcome({
      agentName,
      actionId,
      decisionId,
      executionId: execution.executionId,
      outcomeSummary: "Execution failed",
      input,
      output: {},
      metadata: {
        status: "FAILED",
        context,
        error: {
          message: err.message
        }
      }
    });

    throw err;
  }
}

async function main() {
  console.log("Execution service starting...");

  await eventBus.subscribe("execution.requested", async (event) => {
    try {
      await handleExecutionRequested(event);
    } catch (err) {
      console.error("Execution service handler failed:", err.message);
    }
  });
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Execution service startup failed:", err);
    process.exit(1);
  });
}

module.exports = {
  executeAction,
  handleExecutionRequested,
  main
};
