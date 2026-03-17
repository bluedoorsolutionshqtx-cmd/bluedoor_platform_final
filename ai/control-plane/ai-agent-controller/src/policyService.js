"use strict";

function decide(action, risk) {
  if (!action) {
    return {
      allowed: false,
      requiresApproval: false,
      reason: "Missing action"
    };
  }

  if (risk && risk.deny === true) {
    return {
      allowed: false,
      requiresApproval: false,
      reason: "Risk too high"
    };
  }

  if (risk && risk.requiresApproval === true) {
    return {
      allowed: true,
      requiresApproval: true,
      reason: "Approval required by risk policy"
    };
  }

  return {
    allowed: true,
    requiresApproval: false,
    reason: "Allowed by policy"
  };
}

module.exports = {
  decide
};
