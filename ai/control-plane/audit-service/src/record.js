"use strict";

const fs = require("fs");
const path = require("path");

const auditFile = path.join(__dirname, "../audit-log.json");

function record(event) {

  let log = [];

  if (fs.existsSync(auditFile)) {
    log = JSON.parse(fs.readFileSync(auditFile));
  }

  log.push({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    event
  });

  fs.writeFileSync(auditFile, JSON.stringify(log, null, 2));

  return true;
}

module.exports = {
  record
};
