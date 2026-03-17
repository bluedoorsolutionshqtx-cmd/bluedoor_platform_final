"use strict";

async function assignJob(input) {
  const { jobId = "unknown", crew = 1 } = input;

  return {
    assigned: true,
    jobId,
    crew,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  "dispatch.assign_job": assignJob
};
