"use strict";

const { executeAction } =
  require("../../execution-service/src/index");

async function runRoutingDispatchFlow(input) {

  const routingResult = await executeAction({
    agentName: "bluedoor_routing_agent",
    actionId: "routing.optimize_vrp",
    input
  });

  const jobsCount = input.jobs || 0;
  const crews = input.crews || 1;

  const dispatchResults = [];

  for (let i = 0; i < jobsCount; i++) {

    const dispatchResult = await executeAction({
      agentName: "bluedoor_dispatch_agent",
      actionId: "dispatch.assign_job",
      input: {
        jobId: "job-" + (i + 1),
        crewId: "crew-" + ((i % crews) + 1),
        scheduledDate: new Date().toISOString().slice(0,10)
      }
    });

    dispatchResults.push(dispatchResult);
  }

  return {
    routing: routingResult,
    dispatch: dispatchResults
  };
}

module.exports = {
  runRoutingDispatchFlow
};
