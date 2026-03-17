<!-- ai/governance/agent-contracts/README.md -->
# BlueDoor Agent Contracts

## What this is
Agent contracts are the enforceable authority layer. The control-plane must validate these before any agent/specialist can:
- read data
- take action
- learn/promote models

## Required runtime behavior
1. Load all `*.yaml` contracts on controller boot.
2. Validate against `_schema.json` (fail fast on error).
3. For every agent request: authorize by contract (agent name, action id, confidence, approval rules, rate limits, blast radius).
4. Log every decision and action to audit sinks.

## Change control
- Contracts are versioned.
- All changes go through PR review.
- CI must run schema validation and a policy lint (forbidden actions, missing rollback, learning constraints).

## Files
- `bluedoor_system_health_agent.yaml`
- `bluedoor_routing_agent.yaml`
- `bluedoor_revenue_leak_specialist.yaml`
- `_schema.json`
