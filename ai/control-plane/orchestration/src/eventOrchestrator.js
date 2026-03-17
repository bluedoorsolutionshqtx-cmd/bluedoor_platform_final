"use strict";

const { executeAction } =
  require("../../execution-service/src/index");

const eventBus =
  require("../../ai-agent-controller/src/eventBus");

function startEventOrchestrator() {
  eventBus.subscribe("*", async (event) => {
    if (event.type !== "execution.completed") {
      return;
    }

    if (event?.result?.agentName === "bluedoor_routing_agent") {
      const jobs = event?.result?.result?.jobs || 0;
      const crews = event?.result?.result?.crews || 1;

      for (let i = 0; i < jobs; i++) {
        await executeAction({
          agentName: "bluedoor_dispatch_agent",
          actionId: "dispatch.assign_job",
          input: {
            jobId: "job-" + (i + 1),
            crewId: "crew-" + ((i % crews) + 1),
            scheduledDate: new Date().toISOString().slice(0, 10)
          }
        });
      }
    }
  });

  console.log("Event orchestrator started");
}

module.exports = {
  startEventOrchestrator
};
