# BlueDoor Phoenix – Phase 1 & 2 State

## Completed

### Event System
- Redis Streams event bus
- Event emitter (event-bus)
- Worker consuming via consumer group

### Control Plane Loop
- Registry service (DB-backed)
- Policy service (DB-backed approvals)
- Execution service (DB-backed executions)
- Audit service (DB-backed logs)

### Database
Postgres tables:
- audit_events
- executions
- approvals
- agent_memory
- registry

### Flow
Event → Worker → Registry → Policy → Execution → Audit → DB

### Environment
Running in Termux:
- redis-server
- postgres (pg_ctl)
- Node services (6 processes)

## Status
System is now:
✔ Event-driven  
✔ Stateful  
✔ Persisted  
✔ Executing actions  

Next: Phase 3 (risk engine + agents)
