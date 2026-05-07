import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import pinoHttp from "pino-http";

import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { setupShutdown } from "./lib/shutdown.js";

import healthRoutes from "./routes/health.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());

app.use(express.json());

app.use(
  pinoHttp({
    logger,
  })
);

app.use("/", healthRoutes);

const server = app.listen(env.port, () => {
  logger.info(
    {
      service: env.serviceName,
      port: env.port,
    },
    "Service online"
  );
});

setupShutdown(server);
