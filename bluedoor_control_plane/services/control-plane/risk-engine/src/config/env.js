import dotenv from "dotenv";

dotenv.config();

function required(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing env variable: ${name}`);
  }

  return value;
}

export const env = {
  serviceName: required("SERVICE_NAME"),

  port: Number(process.env.PORT || 3000),

  nodeEnv: process.env.NODE_ENV || "development",

  redis: {
    host: required("REDIS_HOST"),
    port: Number(required("REDIS_PORT")),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  logLevel: process.env.LOG_LEVEL || "info",
};
