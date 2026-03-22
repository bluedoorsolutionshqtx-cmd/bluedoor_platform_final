"use strict";

function normalizeScore(raw) {
  if (typeof raw !== "number") return 0;

  // If someone returns 0–10 scale, normalize it
  if (raw > 1) {
    return Math.min(raw / 10, 1);
  }

  return Math.max(0, Math.min(raw, 1));
}

function deriveLevel(score) {
  if (score >= 0.9) return "CRITICAL";
  if (score >= 0.7) return "HIGH";
  if (score >= 0.5) return "MEDIUM";
  return "LOW";
}

async function evaluate({
  agentName,
  actionId,
  input,
  context,
  confidence
}) {
  let rawScore = 0;

  // Base risk from confidence
  if (typeof confidence === "number") {
    rawScore = 1 - confidence; // lower confidence = higher risk
  }

  // Example: add small risk if missing context
  if (!context || Object.keys(context).length === 0) {
    rawScore += 0.1;
  }

  const score = normalizeScore(rawScore);
  const level = deriveLevel(score);

  console.log("DEBUG risk output =", {
    score,
    level,
    agentName,
    actionId
  });

  return {
    score,
    level,
    agentName,
    actionId
  };
}

module.exports = { evaluate };
