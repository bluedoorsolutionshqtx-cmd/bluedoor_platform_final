"use strict";

const fs = require("fs");
const path = require("path");

const auditFile = path.join(
  __dirname,
  "../data/audit/audit.log"
);

function record(event) {

  const entry = {
    timestamp: new Date().toISOString(),
    ...event
  };

  fs.appendFileSync(
    auditFile,
    JSON.stringify(entry) + "\n"
  );

}

module.exports = {
  record
};
