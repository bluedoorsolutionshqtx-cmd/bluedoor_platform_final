"use strict";

function decide(riskResult, action) {

  if (riskResult.level === "HIGH") {
    return {
      allowed: false,
      requiresApproval: true,
      decision: "REQUIRES_APPROVAL"
    };
  }

  if (riskResult.level === "MEDIUM") {
    return {
      allowed: true,
      requiresApproval: true,
      decision: "REQUIRES_APPROVAL"
    };
  }

  return {
    allowed: true,
    requiresApproval: false,
    decision: "AUTO_EXECUTE"
  };
}

module.exports = {
  decide
};
