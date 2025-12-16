# Services

All services in this directory follow the same contract:

- Entry point: src/index.js
- Start command: npm start / pnpm start
- Stateless (except DB connections)
- Configured entirely via environment variables

Each service is independently deployable.
