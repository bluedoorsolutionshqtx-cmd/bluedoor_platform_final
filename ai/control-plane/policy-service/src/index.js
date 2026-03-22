"use strict";

async function decide({
  decisionId,
  agentName,
  actionId,
  risk,
  input,
  context,
  confidence
}) {
  console.log("DEBUG policy input =", {
    agentName,
    actionId,
    risk,
    confidence
  });

  // Hard deny example
  if (risk?.score >= 0.9) {
    return {
      status: "DENIED",
      allowed: false,
      requiresApproval: false,
      reason: "Risk score too high"
    };
  }

  // Force approval for medium risk
  if (risk?.score >= 0.5) {
    return {
      status: "PENDING_APPROVAL",
      allowed: true,
      requiresApproval: true,
      reason: "Medium risk requires approval"
    };
  }

  // Force approval for low confidence edge case
  if (confidence !== undefined && confidence < 0.7) {
    return {
      status: "PENDING_APPROVAL",
      allowed: true,
      requiresApproval: true,
      reason: "Low confidence requires approval"
    };
  }

  // Default allow
  return {
    status: "APPROVED",
    allowed: true,
    requiresApproval: false,
    reason: "Approved"
  };
}

module.exports = { decide };
