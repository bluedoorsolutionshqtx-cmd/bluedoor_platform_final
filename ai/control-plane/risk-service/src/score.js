"use strict";

function score(payload = {}) {
  const agentName = payload.agentName || "";
  const actionId = payload.actionId || "";
  const input = payload.input || payload.params || {};
  const context = payload.context || {};

  let score = 10;
  let level = "LOW";

  if (actionId.includes("publish")) {
    score += 40;
  }

  if (actionId.includes("delete")) {
    score += 50;
  }

  if (actionId.includes("revenue")) {
    score += 20;
  }

  if (typeof context?.blast_radius?.jobs_affected === "number") {
    score += Math.min(context.blast_radius.jobs_affected, 50);
  }

  if (typeof input?.jobs === "number" && input.jobs > 25) {
    score += 15;
  }

  if (score >= 70) {
    level = "HIGH";
  } else if (score >= 30) {
    level = "MEDIUM";
  }

  return {
    score,
    level,
    agentName,
    actionId
  };
}

module.exports = {
  score
};
