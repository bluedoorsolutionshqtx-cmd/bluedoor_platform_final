module.exports = {
  apps: [
    {
      name: "event-bus",
      cwd: "./event-bus",
      script: "src/index.js",
      interpreter: "node",
      env: { NODE_ENV: "production" }
    },
    {
      name: "registry-service",
      cwd: "./services/registry-service",
      script: "index.js"
    },
    {
      name: "policy-service",
      cwd: "./services/policy-service",
      script: "index.js"
    },
    {
      name: "audit-service",
      cwd: "./services/audit-service",
      script: "index.js"
    },
    {
      name: "execution-service",
      cwd: "./services/execution-service",
      script: "index.js"
    },
    {
      name: "risk-service",
      cwd: "./services/risk-service",
      script: "index.js"
    },
    {
      name: "worker",
      cwd: ".",
      script: "worker.js"
    }
  ]
};
