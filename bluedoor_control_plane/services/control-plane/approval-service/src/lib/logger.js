import pino from "pino";
import { env } from "../config/env.js";

export const logger = pino({
  level: env.logLevel,

  base: {
    service: env.serviceName,
  },

  timestamp: pino.stdTimeFunctions.isoTime,
});
