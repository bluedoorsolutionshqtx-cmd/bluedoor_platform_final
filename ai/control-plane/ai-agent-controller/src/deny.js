"use strict";

const fs = require("fs");
const path = require("path");

const APPROVAL_DIR = path.join(__dirname, "..", "data", "approvals");

const decisionId = process.argv[2];
const deniedBy = process.argv[3] || "admin";

if (!decisionId) {
  console.error("Usage: node src/deny.js <decisionId> [deniedBy]");
  process.exit(1);
}

const files = fs.readdirSync(APPROVAL_DIR).filter(f => f.endsWith(".json"));
const match = files.find(f => f.includes(decisionId));

if (!match) {
  console.error("Approval not found for decisionId:", decisionId);
  process.exit(1);
}

const filePath = path.join(APPROVAL_DIR, match);
const approval = JSON.parse(fs.readFileSync(filePath, "utf8"));

approval.status = "DENIED";
approval.deniedBy = deniedBy;
approval.deniedAt = new Date().toISOString();

fs.writeFileSync(filePath, JSON.stringify(approval, null, 2));
console.log("Denied:", match);
