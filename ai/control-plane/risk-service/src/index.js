"use strict";

const { score } = require("./score");

function evaluate(payload = {}) {
  return score(payload);
}

module.exports = {
  evaluate,
  score
};
