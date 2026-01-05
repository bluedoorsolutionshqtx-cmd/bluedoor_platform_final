import fs from "fs";
import path from "path";

const snapRoot = "ops-ai/snapshots";
const outDir = "ops-ai/output";

let ts = process.argv[2];

if (!ts) {
  const latestFile = path.join(snapRoot, "LATEST.txt");
  if (!fs.existsSync(latestFile)) {
    console.error("No LATEST snapshot found.");
    process.exit(1);
  }
  ts = fs.readFileSync(latestFile, "utf8").trim();
}

const snapDir = path.join(snapRoot, ts);
if (!fs.existsSync(snapDir)) {
  console.error(`Snapshot not found: ${snapDir}`);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

for (const f of fs.readdirSync(snapDir)) {
  const src = path.join(snapDir, f);
  const dst = path.join(outDir, f);
  if (fs.statSync(src).isFile()) fs.copyFileSync(src, dst);
}

console.log(JSON.stringify({ status: "ok", restored: ts, to: outDir }));
