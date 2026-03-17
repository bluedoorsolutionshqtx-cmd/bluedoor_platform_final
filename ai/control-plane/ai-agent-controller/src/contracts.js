"use strict";

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const CONTRACT_DIR = path.resolve(
  process.cwd(),
  "../../governance/agent-contracts"
);

function loadContracts() {

  const contracts = [];

  const files = fs.readdirSync(CONTRACT_DIR);

  for (const file of files) {

    if (!file.endsWith(".yaml") && !file.endsWith(".yml")) {
      continue;
    }

    const fullPath = path.join(CONTRACT_DIR, file);

    const content = fs.readFileSync(fullPath, "utf8");

    const contract = yaml.load(content);

    if (!contract || !contract.agent) {
      console.warn(`Invalid contract: ${file}`);
      continue;
    }

    contracts.push(contract);
  }

  console.log(`Loaded ${contracts.length} agent contracts`);

  return contracts;
}

module.exports = {
  loadContracts
};
