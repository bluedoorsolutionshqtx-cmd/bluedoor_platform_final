"use strict";

const { subscribe, emitEvent } = require("../../ai-agent-controller/src/eventBus");
const executionsRepo = require("../../shared/repos/executionsRepo");

function buildRoutes(jobs, crews) {
  if (crews <= 0) {
    return [];
  }

  const base = Math.floor(jobs / crews);
  const remainder = jobs % crews;
  const routes = [];

  for (let crew = 1; crew <= crews; crew += 1) {
    routes.push({
      crew,
      assignedJobs: base + (crew <= remainder ? 1 : 0)
    });
  }

  return routes;
}

function getHandler(agentName, actionId) {
  if (agentName === "bluedoor_routing_agent" && actionId === "routing.optimize_vrp") {
    return async (input) => {
      const jobs = Number(input.jobs || 0);
      const crews = Number(input.crews || 1);

      return {
        optimized: true,
        jobs,
        crews,
        jobsPerCrew: crews > 0 ? Math.ceil(jobs / crews) : 0,
        routes: buildRoutes(jobs, crews)
      };
    };
  }

  return null;
}

async function handleExecutionRequested(event) {
  console.log(
    "DEBUG execution-service payload =",
    JSON.stringify(event, null, 2)
  );

  const decisionId = event.decisionId || null;
  const agentName = event.agentName || null;
  const actionId = event.actionId || null;
  const input = event.input || {};
  const context = event.context || {};

  let executionRecord = null;
  let executionId = null;

  try {
    executionRecord = await executionsRepo.createExecution({
      decisionId,
      agentName,
      actionId,
      status: "REQUESTED",
      input
    });

    executionId = executionRecord.executionId;

    const handler = getHandler(agentName, actionId);

    if (!handler) {
      throw new Error(`No handler found for ${agentName}:${actionId}`);
    }

    const result = await handler(input);

    const updated = await executionsRepo.markExecuted(executionId, result);

    console.log(
      "Execution persisted:",
      JSON.stringify(updated, null, 2)
    );

    await emitEvent("execution.completed", {
      decisionId,
      executionId,
      agentName,
      actionId,
      input,
      result,
      context
    });
  } catch (err) {
    console.error("Execution failed:", err.message);

    try {
      if (executionId) {
        await executionsRepo.markFailed(executionId, {
          message: err.message
        });
      } else {
        const failed = await executionsRepo.createExecution({
          decisionId,
          agentName,
          actionId,
          status: "FAILED",
          input,
          error: {
            message: err.message
          }
        });

        executionId = failed.executionId;
      }
    } catch (persistErr) {
      console.error("Execution failure persistence failed:", persistErr.message);
    }

    await emitEvent("execution.failed", {
      decisionId,
      executionId,
      agentName,
      actionId,
      input,
      error: {
        message: err.message
      },
      context
    });
  }
}

async function main() {
  console.log("Execution worker starting...");

  await subscribe("execution.requested", async (event) => {
    await handleExecutionRequested(event);
  });
}

main().catch((err) => {
  console.error("Execution worker startup failed:", err);
  process.exit(1);
});
