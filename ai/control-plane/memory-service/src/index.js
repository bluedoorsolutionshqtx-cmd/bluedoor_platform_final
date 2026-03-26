"use strict";

const { subscribe, emitEvent } = require("../../ai-agent-controller/src/eventBus");
const memoryRepo = require("../../shared/repos/memoryRepo");

function summarizeCompleted(event) {
  const actionId = event.actionId || "unknown_action";
  return `Action ${actionId} executed successfully`;
}

function summarizeFailed(event) {
  const actionId = event.actionId || "unknown_action";
  const message = event?.error?.message || "Unknown execution failure";
  return `Action ${actionId} failed: ${message}`;
}

async function handleExecutionCompleted(event) {
  console.log(
    "MEMORY SERVICE received execution.completed =",
    JSON.stringify(
      {
        decisionId: event.decisionId || null,
        executionId: event.executionId || null,
        agentName: event.agentName || null,
        actionId: event.actionId || null
      },
      null,
      2
    )
  );

  const stored = await memoryRepo.storeMemory({
    decisionId: event.decisionId || null,
    executionId: event.executionId || null,
    agentName: event.agentName || null,
    actionId: event.actionId || null,
    outcomeSummary: summarizeCompleted(event),
    input: event.input || {},
    output: event.result || {},
    metadata: {
      status: "EXECUTED",
      eventType: "execution.completed",
      context: event.context || {}
    }
  });

  console.log("Memory stored:", JSON.stringify(stored, null, 2));

  await emitEvent("memory.stored", {
    memoryId: stored.memoryId,
    decisionId: stored.decisionId,
    executionId: stored.executionId,
    agentName: stored.agentName,
    actionId: stored.actionId
  });
}

async function handleExecutionFailed(event) {
  console.log(
    "MEMORY SERVICE received execution.failed =",
    JSON.stringify(
      {
        decisionId: event.decisionId || null,
        executionId: event.executionId || null,
        agentName: event.agentName || null,
        actionId: event.actionId || null
      },
      null,
      2
    )
  );

  const stored = await memoryRepo.storeMemory({
    decisionId: event.decisionId || null,
    executionId: event.executionId || null,
    agentName: event.agentName || null,
    actionId: event.actionId || null,
    outcomeSummary: summarizeFailed(event),
    input: event.input || {},
    output: {},
    metadata: {
      status: "FAILED",
      eventType: "execution.failed",
      context: event.context || {},
      error: event.error || {}
    }
  });

  console.log("Memory stored:", JSON.stringify(stored, null, 2));

  await emitEvent("memory.stored", {
    memoryId: stored.memoryId,
    decisionId: stored.decisionId,
    executionId: stored.executionId,
    agentName: stored.agentName,
    actionId: stored.actionId
  });
}

async function main() {
  console.log("Memory service starting...");

  await subscribe("execution.completed", async (event) => {
    try {
      await handleExecutionCompleted(event);
    } catch (err) {
      console.error("MEMORY SERVICE failed for execution.completed:", err.message);
    }
  });

  await subscribe("execution.failed", async (event) => {
    try {
      await handleExecutionFailed(event);
    } catch (err) {
      console.error("MEMORY SERVICE failed for execution.failed:", err.message);
    }
  });
}

main().catch((err) => {
  console.error("Memory service startup failed:", err);
  process.exit(1);
});
