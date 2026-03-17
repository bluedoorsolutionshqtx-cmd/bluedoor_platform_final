"use strict";

async function recordExecution(execution) {
  console.log("Execution recorded (dev mode):");
  console.log(JSON.stringify(execution, null, 2));

  return {
    execution_id: execution.decisionId || `exec_${Date.now()}`,
    stored: true,
    storage: "dev-memory"
  };
}

module.exports = {
  recordExecution
};
