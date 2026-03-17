"use strict";

const fs = require("fs");
const path = require("path");

const APPROVAL_DIR = path.join(__dirname, "..", "data", "approvals");

const files = fs.existsSync(APPROVAL_DIR)
  ? fs.readdirSync(APPROVAL_DIR).filter(f => f.endsWith(".json"))
  : [];

if (files.length === 0) {
  console.log("No approval files found.");
  process.exit(0);
}

for (const file of files) {
  const full = path.join(APPROVAL_DIR, file);
  try {
    const approval = JSON.parse(fs.readFileSync(full, "utf8"));
    console.log(JSON.stringify({
      file,
      status: approval.status,
      decisionId: approval.decisionId,
      agentName: approval.agentName,
      actionId: approval.actionId,
      risk: approval.risk || null
    }, null, 2));
  } catch (e) {
    console.log(JSON.stringify({ file, error: "Invalid JSON" }, null, 2));
  }
}
