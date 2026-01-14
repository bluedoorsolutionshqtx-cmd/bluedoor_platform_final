import Ajv from "ajv";
import addFormats from "ajv-formats";
import fs from "fs";
import path from "path";

const outDir = "ops-ai/output";
const schemaPath = "ops-ai/schemas/ops-artifact-schema.json";

if (!fs.existsSync(schemaPath)) {
  console.error(`Missing schema: ${schemaPath}`);
  process.exit(1);
}

if (!fs.existsSync(outDir)) {
  console.error(`Missing output dir: ${outDir}`);
  process.exit(1);
}

const schemaRaw = fs.readFileSync(schemaPath, "utf8");
let schema;
try {
  schema = JSON.parse(schemaRaw);
} catch (e) {
  console.error(`[BAD] ${schemaPath}: invalid JSON`);
  process.exit(1);
}

const ajv = new Ajv({
  allErrors: true,
  strict: false
});
addFormats(ajv);

let validate;
try {
  validate = ajv.compile(schema);
} catch (e) {
  console.error(`[BAD] failed to compile schema: ${e?.message || e}`);
  process.exit(1);
}

const files = fs
  .readdirSync(outDir)
  .filter((f) => f.toLowerCase().endsWith(".json"))
  .sort();

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
      const where = err.instancePath && err.instancePath.length ? err.instancePath : "(root)";
      const msg = (err.message || "").trim();
      console.error(` - ${where} ${msg}`.trim());
    }
  } else {
    console.log(`[OK] ${p}`);
  }
}

if (bad > 0) process.exit(1);

console.log(JSON.stringify({ status: "ok", bad: 0, total: files.length }));
