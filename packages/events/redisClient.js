const Redis = require("ioredis");

const config = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6380,
  retryStrategy: (times) => Math.min(times * 50, 2000),
};

const pub = new Redis(config);
const sub = new Redis(config);

pub.on("connect", () => console.log("REDIS PUB CONNECTED"));
sub.on("connect", () => console.log("REDIS SUB CONNECTED"));

module.exports = { pub, sub };
