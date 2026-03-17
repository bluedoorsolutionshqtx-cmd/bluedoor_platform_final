"use strict";

async function recoverSchedule(input) {
  const { missedJobs = 0 } = input;

  return {
    recovered: true,
    rescheduledJobs: missedJobs,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  "schedule.recover": recoverSchedule
};
