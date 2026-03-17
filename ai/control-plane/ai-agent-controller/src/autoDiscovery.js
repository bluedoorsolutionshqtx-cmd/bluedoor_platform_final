"use strict";

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "../../..");
const AGENTS_DIR = path.join(ROOT_DIR, "agents");
const SPECIALISTS_DIR = path.join(ROOT_DIR, "specialists");

function safeRequire(modulePath) {
  try {
    delete require.cache[require.resolve(modulePath)];
    return require(modulePath);
  } catch (err) {
    console.warn(`Auto-discovery skipped module: ${modulePath}`);
    console.warn(err.message);
    return null;
  }
}

function listDirectories(baseDir) {
  if (!fs.existsSync(baseDir)) return [];

  return fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(baseDir, entry.name));
}

function discoverHandlersIn(baseDir, kind) {
  const discovered = [];

  for (const serviceDir of listDirectories(baseDir)) {
    const name = path.basename(serviceDir);
    const handlerPath = path.join(serviceDir, "handler.js");

    if (!fs.existsSync(handlerPath)) {
      continue;
    }

    const handlerModule = safeRequire(handlerPath);

    if (!handlerModule || typeof handlerModule !== "object") {
      continue;
    }

    const actions = Object.entries(handlerModule)
      .filter(([actionId, fn]) => typeof fn === "function")
      .map(([actionId, fn]) => ({
        actionId,
        handler: fn
      }));

    if (actions.length === 0) {
      continue;
    }

    discovered.push({
      kind,
      name,
      handlerPath,
      actions
    });
  }

  return discovered;
}

function discoverAll() {
  return [
    ...discoverHandlersIn(AGENTS_DIR, "agent"),
    ...discoverHandlersIn(SPECIALISTS_DIR, "specialist")
  ];
}

function buildDiscoveredRegistry() {
  const discovered = discoverAll();
  const registry = {};

  for (const service of discovered) {
    registry[service.name] = {};

    for (const action of service.actions) {
      registry[service.name][action.actionId] = action.handler;
    }
  }

  return {
    discovered,
    registry
  };
}

module.exports = {
  discoverAll,
  buildDiscoveredRegistry
};
