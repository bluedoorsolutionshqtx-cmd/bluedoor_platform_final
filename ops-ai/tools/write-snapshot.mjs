import fs from "fs";
import path from "path";

const srcDir = "ops-ai/output";
const snapRoot = "ops-ai/snapshots";

if (!fs.existsSync(srcDir)) {
  console.error(`Missing ${srcDir}`);
  process.exit(1);
}

const ts = new Date().toISOString().replace(/[:.]/g, "-");
const snapDir = path.join(snapRoot, ts);

fs.mkdirSync(snapDir, { recursive: true });

for (const f of fs.readdirSync(srcDir)) {
  const src = path.join(srcDir, f);
  const dst = path.join(snapDir, f);
  if (fs.statSync(src).isFile()) fs.copyFileSync(src, dst);
}

fs.writeFileSync(path.join(snapRoot, "LATEST.txt"), ts + "\n");

console.log(JSON.stringify({ status: "ok", snapshot: ts, path: snapDir }));
