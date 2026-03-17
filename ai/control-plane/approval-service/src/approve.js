"use strict";

const { listPendingApprovals } = require("./index");

try {
  const approvals = listPendingApprovals();

  if (approvals.length === 0) {
    console.log("No pending approvals.");
    process.exit(0);
  }

  for (const item of approvals) {
    console.log(JSON.stringify(item, null, 2));
  }
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
