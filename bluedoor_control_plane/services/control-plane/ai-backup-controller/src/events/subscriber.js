import Redis from "ioredis";

import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

export const subscriber = new Redis({
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password,
});

export async function subscribe(topic, handler) {
  await subscriber.subscribe(topic);

  logger.info({ topic }, "Subscribed");

  subscriber.on("message", async (channel, message) => {
    if (channel !== topic) return;

    try {
      const parsed = JSON.parse(message);

      await handler(parsed);
    } catch (err) {
      logger.error(err, "Subscriber failure");
    }
  });
}
