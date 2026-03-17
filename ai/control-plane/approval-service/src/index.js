"use strict";

const fs = require("fs");
const path = require("path");

const APPROVALS_DIR = path.resolve(
  __dirname,
  "../../ai-agent-controller/data/approvals"
);

function ensureDir() {
  fs.mkdirSync(APPROVALS_DIR, { recursive: true });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function listPendingApprovals() {
  ensureDir();

  const files = fs.readdirSync(APPROVALS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.join(APPROVALS_DIR, f));

  return files
    .map((filePath) => {
      try {
        const data = readJson(filePath);
        return {
          file: path.basename(filePath),
          filePath,
          status: data.status,
          decisionId: data.decisionId,
          agentName: data.agentName,
          actionId: data.actionId,
          risk: data.risk || null
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .filter((x) => x.status === "PENDING_APPROVAL");
}

function findApprovalFile(fileOrDecisionId) {
  ensureDir();

  const files = fs.readdirSync(APPROVALS_DIR).filter((f) => f.endsWith(".json"));

  let match = files.find((f) => f === fileOrDecisionId);

  if (!match) {
    match = files.find((f) => f.includes(fileOrDecisionId));
  }

  if (!match) {
    return null;
  }

  return path.join(APPROVALS_DIR, match);
}

function approveApproval(fileOrDecisionId, approvedBy = "admin") {
  const filePath = findApprovalFile(fileOrDecisionId);
  if (!filePath) {
    throw new Error(`Approval not found: ${fileOrDecisionId}`);
  }

  const approval = readJson(filePath);
  approval.status = "APPROVED";
  approval.approvedBy = approvedBy;
  approval.approvedAt = new Date().toISOString();

  writeJson(filePath, approval);

  return {
    ok: true,
    file: path.basename(filePath),
    status: approval.status,
    decisionId: approval.decisionId
  };
}

function denyApproval(fileOrDecisionId, deniedBy = "admin") {
  const filePath = findApprovalFile(fileOrDecisionId);
  if (!filePath) {
    throw new Error(`Approval not found: ${fileOrDecisionId}`);
  }

  const approval = readJson(filePath);
  approval.status = "DENIED";
  approval.deniedBy = deniedBy;
  approval.deniedAt = new Date().toISOString();

  writeJson(filePath, approval);

  return {
    ok: true,
    file: path.basename(filePath),
    status: approval.status,
    decisionId: approval.decisionId
  };
}

module.exports = {
  listPendingApprovals,
  approveApproval,
  denyApproval
};
