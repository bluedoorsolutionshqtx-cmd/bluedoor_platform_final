import fs from "fs";
import path from "path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const outDir = "ops-ai/output";
const schemaPath = "ops-ai/schemas/ops-artifact.schema.json";

if (!fs.existsSync(schemaPath)) {
  console.error(`Missing schema: ${schemaPath}`);
  process.exit(1);
}

if (!fs.existsSync(outDir)) {
  console.error(`Missing output dir: ${outDir}`);
  process.exit(1);
}

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const files = fs.readdirSync(outDir).filter(f => f.endsWith(".json"));
if (files.length === 0) {
  console.error(`No JSON artifacts found in ${outDir}`);
  process.exit(1);
}

let bad = 0;

for (const f of files) {
  const p = path.join(outDir, f);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    bad++;
    console.error(`[BAD] ${p}: invalid JSON`);
    continue;
  }

  const ok = validate(data);
  if (!ok) {
    bad++;
    console.error(`[BAD] ${p}: schema violations`);
    for (const err of validate.errors || []) {
      console.error(`  - ${err.instancePath || "(root)"} ${err.message}`);
    }
  } else {
    console.log(`[OK] ${p}`);
  }
}

if (bad > 0) process.exit(1);
