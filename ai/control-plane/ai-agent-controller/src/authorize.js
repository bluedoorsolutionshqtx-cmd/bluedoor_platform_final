const crypto = require("crypto");

/**
 * In-memory rate limiter state (process-local).
 * Production upgrade: Redis / durable store.
 */
const RATE_STATE = new Map(); // key -> [timestamps_ms]

function nowMs() {
  return Date.now();
}

function stableKey(...parts) {
  return parts.join("|");
}

function pushAndPrune(key, windowSeconds) {
  const t = nowMs();
  const windowMs = windowSeconds * 1000;

  const arr = RATE_STATE.get(key) || [];
  arr.push(t);

  // prune
  const cutoff = t - windowMs;
  while (arr.length && arr[0] < cutoff) arr.shift();

  RATE_STATE.set(key, arr);
  return arr.length;
}

function getApprovalRequirement(contract, actionId) {
  const ra = contract.spec.guardrails?.require_human_approval;
  if (!ra) return false;

  // overrides win
  const overrides = Array.isArray(ra.overrides) ? ra.overrides : [];
  const hit = overrides.find((o) => o.action_id === actionId);
  if (hit) return !!hit.required;

  return !!ra.default;
}

function findAllowedAction(contract, actionId) {
  const list = contract.spec.authority?.allowed_actions || [];
  return list.find((a) => a.id === actionId) || null;
}

function assertEnv(contract, env) {
  const allowed = contract.spec.scope?.environments || [];
  return allowed.includes(env);
}

function assertTenant(contract, tenant) {
  const allowed = contract.spec.scope?.tenants || [];
  if (allowed.includes("*")) return true;
  return allowed.includes(tenant);
}

function assertConfidence(contract, confidence) {
  const thr = contract.spec.guardrails?.confidence_threshold;
  if (typeof thr !== "number") return true;
  return typeof confidence === "number" && confidence >= thr;
}

/**
 * Blast radius enforcement:
 * Pass context.blast_radius with numeric fields that match the contract keys.
 * Example: { max_jobs_affected: 10, max_crews_affected: 2 }
 * Contract defines: guardrails.blast_radius.max_jobs_affected etc.
 */
function assertBlastRadius(contract, context) {
  const limits = contract.spec.guardrails?.blast_radius || {};
  const req = (context && context.blast_radius) || {};

  for (const [k, limitVal] of Object.entries(limits)) {
    if (typeof limitVal !== "number") continue;

    // contract keys are like max_jobs_affected; request should supply jobs_affected or max_jobs_affected
    const direct = req[k];
    if (typeof direct === "number" && direct > limitVal) {
      return { ok: false, reason: `Blast radius ${k}=${direct} exceeds limit ${limitVal}` };
    }

    // convenience mapping: if contract has max_X, allow request to provide X
    if (k.startsWith("max_")) {
      const altKey = k.slice(4); // remove "max_"
      const altVal = req[altKey];
      if (typeof altVal === "number" && altVal > limitVal) {
        return { ok: false, reason: `Blast radius ${altKey}=${altVal} exceeds limit ${limitVal}` };
      }
    }
  }

  return { ok: true };
}

/**
 * Rate limit enforcement:
 * contract.guardrails.rate_limits.per_action[actionId] = { max, window_seconds }
 */
function assertRateLimit(contract, agentName, actionId) {
  const perAction = contract.spec.guardrails?.rate_limits?.per_action || {};
  const rule = perAction[actionId];
  if (!rule) return { ok: true };

  const max = rule.max;
  const windowSeconds = rule.window_seconds;

  if (typeof max !== "number" || typeof windowSeconds !== "number") return { ok: true };

  const key = stableKey("rate", agentName, actionId);
  const count = pushAndPrune(key, windowSeconds);

  if (count > max) {
    return { ok: false, reason: `Rate limit exceeded for ${actionId}: ${count}/${max} in ${windowSeconds}s` };
  }
  return { ok: true };
}

/**
 * Core authorization decision.
 * Returns:
 *  - allowed: boolean
 *  - requiresApproval: boolean
 *  - decisionId: string
 *  - reason?: string
 *  - contractVersion?: string
 */
function authorizeAction(contracts, agentName, actionId, confidence, context) {
  const decisionId = crypto.randomUUID();

  const contract = contracts[agentName];
  if (!contract) {
    return { allowed: false, requiresApproval: false, decisionId, reason: `Unknown agent: ${agentName}` };
  }

  const env = (context && context.env) || "dev";
  const tenant = (context && context.tenant) || "*";

  if (!assertEnv(contract, env)) {
    return { allowed: false, requiresApproval: false, decisionId, reason: `Env not permitted: ${env}` };
  }
  if (!assertTenant(contract, tenant)) {
    return { allowed: false, requiresApproval: false, decisionId, reason: `Tenant not permitted: ${tenant}` };
  }

  // Forbidden actions hard-block
  const forbidden = contract.spec.authority?.forbidden_actions || [];
  if (forbidden.includes(actionId)) {
    return { allowed: false, requiresApproval: false, decisionId, reason: `Forbidden action: ${actionId}` };
  }

  // Must be explicitly allowed
  const allowedAction = findAllowedAction(contract, actionId);
  if (!allowedAction) {
    return { allowed: false, requiresApproval: false, decisionId, reason: `Action not allowed: ${actionId}` };
  }

  // Confidence check
  if (!assertConfidence(contract, confidence)) {
    return {
      allowed: false,
      requiresApproval: false,
      decisionId,
      reason: `Confidence ${confidence} below threshold ${contract.spec.guardrails.confidence_threshold}`,
      contractVersion: contract.metadata?.version
    };
  }

  // Blast radius check
  const br = assertBlastRadius(contract, context);
  if (!br.ok) {
    return { allowed: false, requiresApproval: false, decisionId, reason: br.reason, contractVersion: contract.metadata?.version };
  }

  // Rate limit check
  const rl = assertRateLimit(contract, agentName, actionId);
  if (!rl.ok) {
    return { allowed: false, requiresApproval: false, decisionId, reason: rl.reason, contractVersion: contract.metadata?.version };
  }

  // Approval gate
  const requiresApproval = getApprovalRequirement(contract, actionId);

  return {
    allowed: true,
    requiresApproval,
    decisionId,
    contractVersion: contract.metadata?.version
  };
}

module.exports = { authorizeAction };
