"use strict";

const crypto = require("crypto");

function stableStringify(obj) {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

function hashDecision(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

/**
 * Authorize an action for this agent.
 * Returns:
 *  - { allowed: true, requiresApproval: false }
 *  - { allowed: true, requiresApproval: true }
 *  - { allowed: false, requiresApproval: false, reason }
 */
function authorize({ actionId, confidence, context }) {
  // hard deny anything outside this agent’s contract surface
  const allowedActions = new Set([
    "routing.optimize_vrp",
    "routing.publish_plan"
  ]);

  if (!allowedActions.has(actionId)) {
    return { allowed: false, requiresApproval: false, reason: `Forbidden action: ${actionId}` };
  }

  // basic confidence gate
  if (typeof confidence === "number" && confidence < 0.6) {
    return { allowed: false, requiresApproval: false, reason: `Confidence too low: ${confidence}` };
  }

  // blast radius gate (example guardrail)
  const jobsAffected = context?.blast_radius?.jobs_affected;
  if (typeof jobsAffected === "number" && jobsAffected > 25) {
    return { allowed: false, requiresApproval: false, reason: `Blast radius jobs_affected=${jobsAffected} exceeds limit 25` };
  }

  // optimize: allowed without approval
  if (actionId === "routing.optimize_vrp") {
    return { allowed: true, requiresApproval: false };
  }

  // publish: always requires approval
  if (actionId === "routing.publish_plan") {
    return { allowed: true, requiresApproval: true };
  }

  return { allowed: false, requiresApproval: false, reason: `Unhandled action: ${actionId}` };
}

// ---- Handlers ----

async function optimizeVRP(params) {
  // minimal stub
  const date = params?.date || new Date().toISOString().slice(0, 10);
  return { optimized: true, jobs: 24, crews: 3, date };
}

async function publishPlan(params) {
  // minimal stub
  const planId = params?.plan_id || params?.planId || null;
  return { published: true, planId };
}

// Export as a contract-compatible object
module.exports = {
  authorize,
  optimizeVRP,
  publishPlan,

  // optional helper for deterministic ids (not required, but useful)
  _hashDecision: (payload) => hashDecision(stableStringify(payload))
};
