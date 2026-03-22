"use strict";

const fs = require("fs");
const path = require("path");

function getContractsDir() {
  return path.resolve(__dirname, "../../../governance/agent-contracts");
}

function loadContracts() {
  const contractsDir = getContractsDir();

  if (!fs.existsSync(contractsDir)) {
    throw new Error(`Contracts directory not found: ${contractsDir}`);
  }

  const files = fs.readdirSync(contractsDir);
  const contracts = {};

  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    const fullPath = path.join(contractsDir, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const contract = JSON.parse(raw);

    if (!contract.actionId) {
      throw new Error(`Contract missing actionId: ${fullPath}`);
    }

    contracts[contract.actionId] = contract;
  }

  return contracts;
}

function getContract(contracts, actionId) {
  if (!contracts || !actionId) return null;
  return contracts[actionId] || null;
}

function validateAgainstContract(contract, plan) {
  if (!contract) {
    return {
      valid: false,
      reason: "No contract found for action"
    };
  }

  if (contract.agentName && contract.agentName !== plan.agentName) {
    return {
      valid: false,
      reason: `Contract agent mismatch: expected ${contract.agentName}, got ${plan.agentName}`
    };
  }

  const input = plan.params || plan.input || {};
  const requiredParams = Array.isArray(contract.requiredParams)
    ? contract.requiredParams
    : [];

  for (const key of requiredParams) {
    if (!Object.prototype.hasOwnProperty.call(input, key)) {
      return {
        valid: false,
        reason: `Missing required param: ${key}`
      };
    }
  }

  const minConfidence =
    typeof contract.minConfidence === "number" ? contract.minConfidence : 0;

  const confidence =
    typeof plan.confidence === "number" ? plan.confidence : 1;

  if (confidence < minConfidence) {
    return {
      valid: false,
      reason: `Confidence ${confidence} below minimum ${minConfidence}`
    };
  }

  return {
    valid: true,
    reason: null
  };
}

module.exports = {
  loadContracts,
  getContract,
  validateAgainstContract
};
