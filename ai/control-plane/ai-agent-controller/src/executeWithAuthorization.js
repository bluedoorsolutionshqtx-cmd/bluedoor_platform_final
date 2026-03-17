"use strict";

const crypto = require("crypto");

const eventBus = require("./eventBus");

const { evaluate: evaluateRisk } = require("../../risk-service/src");
const { decide } = require("../../policy-service/src");
const executeAction = require("../../execution-service/src/executeAction");

const approvalsRepo = require("../../shared/repos/approvalsRepo");
const executionsRepo = require("../../shared/repos/executionsRepo");
const { recordAuditEvent } = require("../../shared/repos/auditRepo");

const memoryService = require("../../memory-service/src");

function buildDecisionId() {
  return `dec_${Date.now()}_${crypto.randomUUID()}`;
}

function normalizeInput(plan) {
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
        : status !== "DENIED" && status !== "DENY",
    requiresApproval:
      typeof policyDecision?.requiresApproval === "boolean"
        ? policyDecision.requiresApproval
        : status === "APPROVAL_REQUIRED" || status === "PENDING_APPROVAL",
    reason: policyDecision?.reason || null
  };
}

async function executeWithAuthorization(plan) {
  const input = normalizeInput(plan);
 
  console.log("DEBUG executeWithAuthorization plan =", JSON.stringify(plan, null, 2));
  console.log("DEBUG normalized input =", JSON.stringify(input, null, 2));
 
  const decision = {
    decisionId: buildDecisionId(),
    agentName: plan.agentName,
    actionId: plan.actionId,
    params: input,
    context: plan.context || {},
    confidence: plan.confidence || 0
  };

  console.log("EVENT = action.proposed");

  if (eventBus && typeof eventBus.emitEvent === "function") {
  await eventBus.emitEvent("action.proposed", {
      decisionId: decision.decisionId,
      agentName: decision.agentName,
      actionId: decision.actionId,
      params: decision.params,
      context: decision.context,
      confidence: decision.confidence
    });
  }

  const risk = await evaluateRisk({
    agentName: decision.agentName,
    actionId: decision.actionId,
    input: decision.params,
    context: decision.context
  });

  const rawPolicyDecision = await decide({
    agentName: decision.agentName,
    actionId: decision.actionId,
    risk,
    confidence: decision.confidence,
    input: decision.params,
    context: decision.context
  });

  const policy = normalizePolicy(rawPolicyDecision);

  console.log("EVENT = policy.decided");

  if (eventBus && typeof eventBus.emitEvent === "function")
    await eventBus.emitEvent("policy.decided", {
      decisionId: decision.decisionId,
      agentName: decision.agentName,
      actionId: decision.actionId,
      risk,
      policy
    });
  }

  if (!policy.allowed) {
    await recordAuditEvent({
      eventType: "ACTION_DENIED",
      agentName: decision.agentName,
      actionId: decision.actionId,
      decisionId: decision.decisionId,
      payload: {
        input: decision.params,
        context: decision.context,
        risk,
        policy
      }
    });

    if (eventBus && typeof eventBus.emit === "function") {
      await eventBus.emitEvent("action.denied", {
        decisionId: decision.decisionId,
        agentName: decision.agentName,
        actionId: decision.actionId,
        reason: policy.reason
      });
    }

    return {
      status: "DENIED",
      decision: {
        allowed: false,
        requiresApproval: false,
        decisionId: decision.decisionId,
        reason: policy.reason || "Denied by policy"
      }
    };
  }

  if (policy.requiresApproval) {
    await approvalsRepo.createApproval({
      decisionId: decision.decisionId,
      agentName: decision.agentName,
      actionId: decision.actionId,
      status: "PENDING_APPROVAL",
      requestedBy: "system",
      payload: {
        input: decision.params,
        context: decision.context,
        confidence: decision.confidence
      },
      risk
    });

    if (eventBus && typeof eventBus.emit === "function") {
      await eventBus.emitEvent("approval.required", {
        decisionId: decision.decisionId,
        agentName: decision.agentName,
        actionId: decision.actionId,
        risk
      });
    }

    return {
      status: "PENDING_APPROVAL",
      decision: {
        allowed: true,
        requiresApproval: true,
        decisionId: decision.decisionId,
        reason: policy.reason || "Approval required"
      }
    };
  }

  try {
    const executionResult = await executeAction({
     agentName: plan.agentName,
     actionId: plan.actionId,
     input: plan.params || plan.input || {},
     context: plan.context || {}
    });

    const finalStatus = executionResult?.status || "EXECUTED";
    const finalResult =
      executionResult && Object.prototype.hasOwnProperty.call(executionResult, "result")
        ? executionResult.result
        : executionResult;

    const executionRecord = await executionsRepo.recordExecution({
      decisionId: decision.decisionId,
      agentName: decision.agentName,
      actionId: decision.actionId,
      status: finalStatus,
      input: decision.params,
      result: finalResult
    });

    await memoryService.storeOutcome({
      agentName: decision.agentName,
      actionId: decision.actionId,
      outcomeSummary: "Action executed successfully",
      input: decision.params,
      output: finalResult,
      metadata: {
        decisionId: decision.decisionId,
        executionId: executionRecord.execution_id
      }
    });

    await recordAuditEvent({
      eventType: "EXECUTION_COMPLETED",
      agentName: decision.agentName,
      actionId: decision.actionId,
      decisionId: decision.decisionId,
      executionId: executionRecord.execution_id,
      payload: {
        input: decision.params,
        context: decision.context,
        result: finalResult
      }
    });

    console.log("EVENT = execution.completed");

    if (eventBus && typeof eventBus.emit === "function") {
      await eventBus.emitEvent("execution.completed", {
        decisionId: decision.decisionId,
        executionId: executionRecord.execution_id,
        agentName: decision.agentName,
        actionId: decision.actionId,
        result: finalResult
      });
    }

    return {
      status: finalStatus,
      result: finalResult
    };
  } catch (err) {
    const failedExecution = await executionsRepo.recordExecution({
      decisionId: decision.decisionId,
      agentName: decision.agentName,
      actionId: decision.actionId,
      status: "FAILED",
      input: decision.params,
      error: {
        message: err.message
      }
    });

    await recordAuditEvent({
      eventType: "EXECUTION_FAILED",
      agentName: decision.agentName,
      actionId: decision.actionId,
      decisionId: decision.decisionId,
      executionId: failedExecution.execution_id,
      payload: {
        input: decision.params,
        context: decision.context,
        error: err.message
      }
    });

    if (eventBus && typeof eventBus.emit === "function") {
      await eventBus.emitEvent("execution.failed", {
        decisionId: decision.decisionId,
        executionId: failedExecution.execution_id,
        agentName: decision.agentName,
        actionId: decision.actionId,
        error: err.message
      });
    }

    throw err;
  }
}

module.exports = executeWithAuthorization;
