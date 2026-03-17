"use strict";

const { denyApproval } = require("./index");

const target = process.argv[2];
const deniedBy = process.argv[3] || "admin";

if (!target) {
  console.error("Usage: node deny.js <file-or-decisionId> [deniedBy]");
  process.exit(1);
}

try {
  const result = denyApproval(target, deniedBy);
  console.log(JSON.stringify(result, null, 2));
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
