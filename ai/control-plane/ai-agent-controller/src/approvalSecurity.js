const crypto = require("crypto");

function sortKeys(x) {
  if (Array.isArray(x)) return x.map(sortKeys);
  if (x && typeof x === "object") {
    return Object.keys(x)
      .sort()
      .reduce((acc, k) => {
        const v = x[k];
        acc[k] = v === undefined ? null : sortKeys(v);
        return acc;
      }, {});
  }
  return x;
}

function canonicalize(obj) {
  return JSON.stringify(sortKeys(obj));
}

function signApproval(approval, secret) {
  const payload = { ...approval };
  delete payload.signature;
  const data = canonicalize(payload);
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

function verifyApproval(approval, secret) {
  if (!approval || !approval.signature) return false;
  const expected = signApproval(approval, secret);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(approval.signature));
  } catch {
    return false;
  }
}

module.exports = { signApproval, verifyApproval };
