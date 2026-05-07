import { Router } from "express";

const router = Router();

router.get("/health", (_, res) => {
  res.json({
    status: "ok",
    service: "agent-controller",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
