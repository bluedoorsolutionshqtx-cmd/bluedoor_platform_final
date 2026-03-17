"use strict";

async function detectLeak(input) {
  const { invoices = 0, payments = 0 } = input;

  const missingRevenue = invoices - payments;

  return {
    leakDetected: missingRevenue > 0,
    invoices,
    payments,
    missingRevenue,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  "revenue.detect_leak": detectLeak
};
