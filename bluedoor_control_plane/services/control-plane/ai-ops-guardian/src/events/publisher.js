import { redis } from "../lib/redis.js";
import { logger } from "../lib/logger.js";

export async function publish(topic, payload) {
  const event = {
    timestamp: new Date().toISOString(),
    payload,
  };

  await redis.publish(topic, JSON.stringify(event));

  logger.info(
    {
      topic,
      payload,
    },
    "Event published"
  );
}
