"use strict";

const crypto = require("crypto");

const eventBus = require("./eventBus");
const { validateAgainstContract } = require("./contracts");

const { evaluate: evaluateRisk } = require("../../risk-service/src");
const { decide } = require("../../policy-service/src");

const auditRepo = require("../../shared/repos/auditRepo");

function buildDecisionId() {
  return `dec_${Date.now()}_${crypto.randomUUID()}`;
}

function normalizeInput(plan) {
  if (!plan || typeof plan !== "object") {
    return {};
  }

  return plan.params || plan.input || {};
}

function normalizePolicy(policyDecision) {
  const status =
    policyDecision?.status ||
    (policyDecision?.allowed === false
      ? "DENIED"
      : policyDecision?.requiresApproval
        ? "PENDING_APPROVAL"
        : "APPROVED");

  return {
    status,
    allowed:
      typeof policyDecision?.allowed === "boolean"
        ? policyDecision.allowed
        : status !== "DENIED",
    requiresApproval:
      typeof policyDecision?.requiresApproval === "boolean"
        ? policyDecision.requiresApproval
        : status === "PENDING_APPROVAL",
    reason: policyDecision?.reason || null
  };
}

async function safeAudit(event) {
  try {
    await auditRepo.recordAuditEvent(event);
  } catch (err) {
    console.error("Audit write failed:", err.message);
  }
}

async function executeWithAuthorization(plan, contract = null) {
  const input = normalizeInput(plan);

  console.log(
    "DEBUG executeWithAuthorization plan =",
    JSON.stringify(plan, null, 2)
  );
  console.log(
    "DEBUG normalized input =",
    JSON.stringify(input, null, 2)
  );

  const contractCheck = validateAgainstContract(contract, {
    agentName: plan.agentName,
    actionId: plan.actionId,
    params: input,
    input,
    confidence: plan.confidence
  });

  if (!contractCheck.valid) {
    console.log("CONTRACT DENIED:", contractCheck.reason);

    await safeAudit({
      eventType: "ACTION_DENIED",
      agentName: plan.agentName,
      actionId: plan.actionId,
      decisionId: null,
      payload: {
        stage: "contract",
        input,
        context: plan.context || {},
        reason: contractCheck.reason
      }
    });

    return {
      status: "DENIED",
      decision: {
        allowed: false,
        requiresApproval: false,
        decisionId: null,
        reason: contractCheck.reason
      }
    };
  }

  const decisionId = buildDecisionId();

  await eventBus.emitEvent("action.proposed", {
    decisionId,
    agentName: plan.agentName,
    actionId: plan.actionId,
    params: input,
    context: plan.context || {},
    confidence: plan.confidence
  });

  const risk = await evaluateRisk({
    agentName: plan.agentName,
    actionId: plan.actionId,
    params: input,
    input,
    context: plan.context || {},
    confidence: plan.confidence,
    contract
  });

  const policyDecision = await decide({
    decisionId,
    agentName: plan.agentName,
    actionId: plan.actionId,
    params: input,
    input,
    context: plan.context || {},
    confidence: plan.confidence,
    risk,
    contract
  });

  const policy = normalizePolicy(policyDecision);

  await eventBus.emitEvent("policy.decided", {
    decisionId,
    agentName: plan.agentName,
    actionId: plan.actionId,
    risk,
    policy
  });

  if (!policy.allowed) {
    await safeAudit({
      eventType: "ACTION_DENIED",
      agentName: plan.agentName,
      actionId: plan.actionId,
      decisionId,
      payload: {
        stage: "policy",
        input,
        context: plan.context || {},
        risk,
        reason: policy.reason
      }
    });

    return {
      status: "DENIED",
      decision: {
        allowed: false,
        requiresApproval: false,
        decisionId,
        reason: policy.reason || "Denied by policy"
      }
    };
  }

  if (policy.requiresApproval) {
    await eventBus.emitEvent("approval.required", {
      decisionId,
      agentName: plan.agentName,
      actionId: plan.actionId,
      risk,
      policy,
      input,
      context: plan.context || {}
    });

    await safeAudit({
      eventType: "APPROVAL_REQUIRED",
      agentName: plan.agentName,
      actionId: plan.actionId,
      decisionId,
      payload: {
        input,
        context: plan.context || {},
        risk,
        reason: policy.reason
      }
    });

    return {
      status: "PENDING_APPROVAL",
      decision: {
        allowed: true,
        requiresApproval: true,
        decisionId,
        reason: policy.reason || "Approval required"
      }
    };
  }

  await eventBus.emitEvent("execution.requested", {
    decisionId,
    agentName: plan.agentName,
    actionId: plan.actionId,
    input,
    context: plan.context || {}
  });

  await safeAudit({
    eventType: "EXECUTION_REQUESTED",
    agentName: plan.agentName,
    actionId: plan.actionId,
    decisionId,
    payload: {
      input,
      context: plan.context || {},
      risk,
      policy
    }
  });

  return {
    status: "REQUESTED",
    decision: {
      allowed: true,
      requiresApproval: false,
      decisionId,
      reason: policy.reason || "Execution requested"
    }
  };
}

module.exports = executeWithAuthorization;
