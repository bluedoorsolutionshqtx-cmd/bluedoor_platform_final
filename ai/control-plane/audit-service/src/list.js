"use strict";

const fs = require("fs");
const path = require("path");

const auditFile = path.join(__dirname, "../audit-log.json");

function list() {

  if (!fs.existsSync(auditFile)) {
    return [];
  }

  return JSON.parse(fs.readFileSync(auditFile));
}

module.exports = {
  list
};
