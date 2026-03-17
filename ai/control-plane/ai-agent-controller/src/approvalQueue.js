const fs = require("fs");
const path = require("path");

const QUEUE_DIR = path.resolve(__dirname, "../data/approvals");

function ensureDir() {
  if (!fs.existsSync(QUEUE_DIR)) fs.mkdirSync(QUEUE_DIR, { recursive: true });
}

function enqueueApproval(item) {
  ensureDir();
  const filename = `${Date.now()}-${item.decisionId}.json`;
  const filePath = path.join(QUEUE_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(item, null, 2), "utf-8");
  return { queued: true, filePath };
}

module.exports = { enqueueApproval, QUEUE_DIR };
