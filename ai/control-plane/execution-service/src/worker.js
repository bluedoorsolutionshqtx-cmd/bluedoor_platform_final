"use strict";

const { subscribe, emitEvent } = require("../../ai-agent-controller/src/eventBus");

console.log("Execution worker starting...");

function getHandler(agentName, actionId) {
  if (agentName === "bluedoor_routing_agent" && actionId === "routing.optimize_vrp") {
    return async (input) => {
      const jobs = input.jobs || 0;
      const crews = input.crews || 1;

      const jobsPerCrew = crews > 0 ? Math.floor(jobs / crews) : 0;

      return {
        optimized: true,
        jobs,
        crews,
        jobsPerCrew,
        routes: [
          {
            crew: 1,
            assignedJobs: jobs
          }
        ]
      };
    };
  }

  return null;
}

subscribe("execution.requested", async (event) => {
  console.log("DEBUG execution-service payload =", event);

  try {
    const { agentName, actionId, input, context } = event;

    const handler = getHandler(agentName, actionId);

    if (!handler) {
      throw new Error(`No handler found for ${agentName}:${actionId}`);
    }

    const result = await handler(input || {});

    console.log("Execution recorded (dev mode):", {
      status: "EXECUTED",
      input,
      result
    });

    await emitEvent("execution.completed", {
      agentName,
      actionId,
      input,
      result,
      context
    });

  } catch (err) {
    console.error("Execution failed:", err.message);

    await emitEvent("execution.failed", {
      error: err.message,
      input: event.input || {},
      context: event.context || {}
    });
  }
});
