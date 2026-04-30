module.exports = {
  apps: [
    {
      name: "registry",
      cwd: "./bluedoor_control_plane/services/control-plane/registry-service",
      script: "npm",
      args: "start"
    },
    {
      name: "policy",
      cwd: "./bluedoor_control_plane/services/control-plane/policy-service",
      script: "npm",
      args: "start"
    },
    {
      name: "risk",
      cwd: "./bluedoor_control_plane/services/control-plane/risk-engine",
      script: "npm",
      args: "start"
    },
    {
      name: "approval",
      cwd: "./bluedoor_control_plane/services/control-plane/approval-service",
      script: "npm",
      args: "start"
    },
    {
      name: "execution",
      cwd: "./bluedoor_control_plane/services/control-plane/execution-service",
      script: "npm",
      args: "start"
    },
    {
      name: "audit",
      cwd: "./bluedoor_control_plane/services/control-plane/audit-service",
      script: "npm",
      args: "start"
    },
    {
      name: "memory",
      cwd: "./bluedoor_control_plane/services/control-plane/memory-service",
      script: "npm",
      args: "start"
    },
    {
      name: "contract",
      cwd: "./bluedoor_control_plane/services/control-plane/contract-service",
      script: "npm",
      args: "start"
    },
    {
      name: "monitoring",
      cwd: "./bluedoor_control_plane/services/control-plane/monitoring-service",
      script: "npm",
      args: "start"
    },
    {
      name: "replay-worker",
      script: "node",
      args: "./workers/replay-worker.js"
    }
  ]
};
