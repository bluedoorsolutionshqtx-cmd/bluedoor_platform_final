import { logger } from "./logger.js";
import { redis } from "./redis.js";

export function setupShutdown(server) {
  async function shutdown(signal) {
    logger.warn({ signal }, "Shutdown initiated");

    try {
      await redis.quit();

      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    } catch (err) {
      logger.error(err, "Shutdown failure");
      process.exit(1);
    }
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}
