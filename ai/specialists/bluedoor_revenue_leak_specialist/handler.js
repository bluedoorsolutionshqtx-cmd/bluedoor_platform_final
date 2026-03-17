"use strict";

async function detect_leak(req) {

  return {

    detected: true,
    accountId: req?.params?.accountId,
    severity: "medium"

  };

}

module.exports = {

  actions: {

    "finance.detect_revenue_leak": detect_leak

  }

};
