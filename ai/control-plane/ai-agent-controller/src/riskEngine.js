"use strict";

function score(action) {

  let riskScore = 0;

  if (!action) {
    riskScore = 100;
  }

  if (action.actionId && action.actionId.includes("publish")) {
    riskScore += 30;
  }

  if (action.agentName && action.agentName.includes("routing")) {
    riskScore += 10;
  }

  let level = "low";

  if (riskScore >= 60) level = "high";
  else if (riskScore >= 30) level = "medium";

  return {
    score: riskScore,
    level,
    requiresApproval: riskScore >= 40,
    deny: riskScore >= 90
  };
}

module.exports = {
  score
};
