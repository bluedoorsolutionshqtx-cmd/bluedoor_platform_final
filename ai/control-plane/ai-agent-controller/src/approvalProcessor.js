"use strict";

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const AUDIT_DIR = path.join(DATA_DIR, "audit");
const APPROVALS_DIR = path.join(DATA_DIR, "approvals");

function ensureDirs() {
  fs.mkdirSync(AUDIT_DIR, { recursive: true });
  fs.mkdirSync(APPROVALS_DIR, { recursive: true });
}

function nowIso() {
  return new Date().toISOString();
}

function appendAudit(event) {
  ensureDirs();
  const file = path.join(AUDIT_DIR, "decisions.jsonl");
  fs.appendFileSync(file, JSON.stringify(event) + "\n", "utf8");
  return file;
}

function safeReadJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return { ok: true, value: parsed };
  } catch (e) {
    return { ok: false, error: e };
  }
}

function writeJson(filePath, obj) {
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), "utf8");
}

async function processApprovals(_contracts, actionHandlers) {
  ensureDirs();

  const files = fs
    .readdirSync(APPROVALS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.join(APPROVALS_DIR, f));

  for (const filePath of files) {
    const read = safeReadJson(filePath);
    if (!read.ok) {
      console.log("Skipping invalid JSON:", path.basename(filePath));
      appendAudit({
        ts: nowIso(),
        event: "approval.invalid_json",
        filePath,
        error: String(read.error && read.error.message ? read.error.message : read.error),
      });
      continue;
    }

    const approval = read.value;

    // Only execute APPROVED items
    if (approval.status !== "APPROVED") continue;

    // Idempotency guard
    if (approval.executedAt) continue;

    const actionId = approval.actionId;
    const handler = actionHandlers[actionId];

    if (typeof handler !== "function") {
      appendAudit({
        ts: nowIso(),
        event: "approval.no_handler",
        decisionId: approval.decisionId,
        actionId,
        filePath,
      });
      continue;
    }

    console.log("Processing approved action:", actionId);

    appendAudit({
      ts: nowIso(),
      event: "approval.exec.started",
      decisionId: approval.decisionId,
      actionId,
      filePath,
    });

    try {
      const result = await handler({
        agentName: approval.agentName,
        actionId: approval.actionId,
        confidence: approval.confidence,
        params: approval.params || {},
        context: approval.context || {},
      });

      approval.event = "approval.executed";
      approval.executedAt = nowIso();
      approval.status = "EXECUTED";
      approval.result = result;

      writeJson(filePath, approval);

      appendAudit({
        ts: nowIso(),
        event: "approval.exec.succeeded",
        decisionId: approval.decisionId,
        actionId,
        filePath,
      });
    } catch (e) {
      approval.event = "approval.exec.failed";
      approval.executedAt = nowIso();
      approval.status = "FAILED";
      approval.error = String(e && e.message ? e.message : e);

      writeJson(filePath, approval);

      appendAudit({
        ts: nowIso(),
        event: "approval.exec.failed",
        decisionId: approval.decisionId,
        actionId,
        filePath,
        error: approval.error,
      });
    }
  }
}

module.exports = { processApprovals };
