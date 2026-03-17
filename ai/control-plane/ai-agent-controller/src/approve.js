const fs = require("fs");
const path = require("path");
const { signApproval } = require("./approvalSecurity");

const APPROVAL_DIR = path.join(__dirname, "../data/approvals");

function usage() {
  console.log("Usage: node src/approve.js <filename.json> <approvedBy>");
  process.exit(1);
}

const file = process.argv[2];
const approvedBy = process.argv[3];
if (!file || !approvedBy) usage();

const secret = process.env.BLUEDOOR_APPROVAL_SECRET;
if (!secret) {
  console.log("Missing BLUEDOOR_APPROVAL_SECRET");
  process.exit(1);
}

const fullPath = path.join(APPROVAL_DIR, file);
if (!fs.existsSync(fullPath)) {
  console.log("File not found:", fullPath);
  process.exit(1);
}

const approval = JSON.parse(fs.readFileSync(fullPath, "utf8"));

approval.status = "APPROVED";
approval.approvedAt = new Date().toISOString();
approval.approvedBy = approvedBy;

// Sign last
approval.signature = signApproval(approval, secret);

fs.writeFileSync(fullPath, JSON.stringify(approval, null, 2), "utf8");
console.log("Approved + signed:", file);
