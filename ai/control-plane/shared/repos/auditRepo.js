"use strict";

async function recordAuditEvent(event) {
  console.log("Audit event (dev mode):");
  console.log(JSON.stringify(event, null, 2));

  return {
    stored: true,
    storage: "dev-memory"
  };
}

module.exports = {
  recordAuditEvent
};
