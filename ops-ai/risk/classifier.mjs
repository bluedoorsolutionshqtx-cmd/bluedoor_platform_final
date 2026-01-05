import fs from "fs";

const output = {
  status: "ok",
  warnings: [],
  metrics: {},
  timestamp: new Date().toISOString()
};

fs.mkdirSync("ops-ai/output", { recursive: true });
fs.writeFileSync(
  "ops-ai/output/risk.json",
  JSON.stringify(output, null, 2)
);

console.log(JSON.stringify(output));
