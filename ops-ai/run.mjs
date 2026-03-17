import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const outputDir = path.join(__dirname, "output");
fs.mkdirSync(outputDir, { recursive: true });

console.log("[Ops-AI] Starting run");

// ---- Judge ----
console.log("[Ops-AI] Judge");
await import("./judge/judge.mjs");

// ---- Risk ----
console.log("[Ops-AI] Risk");
await import("./risk/classifier.mjs");

// ---- RAG ----
console.log("[Ops-AI] RAG");
await import("./rag/build-manifest.mjs");

// ---- Validate ----
console.log("[Ops-AI] Validate artifacts");
await import("./tools/validate-artifacts.mjs");

// ---- Snapshot ----
console.log("[Ops-AI] Snapshot");
await import("./tools/write-snapshot.mjs");
await import("./tools/write-metrics.mjs");

console.log(JSON.stringify({
  status: "ok",
  phase: "ops-ai-run",
  artifacts: fs.readdirSync(outputDir)
}, null, 2));
