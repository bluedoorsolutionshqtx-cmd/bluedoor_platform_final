export async function dispatchAgent(payload) {
  console.log("Dispatch Agent running for job:", payload.jobId);

  // simulate route optimization
  return {
    route: "optimized",
    jobId: payload.jobId
  };
}
