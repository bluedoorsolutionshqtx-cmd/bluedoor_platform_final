import express from "express";
import { createClient } from "redis";

const app = express();
app.use(express.json());

const redis = createClient({
  url: "redis://127.0.0.1:6379"
});

await redis.connect();

const STREAM = "bd_events";

// 🔴 EMIT ENDPOINT
app.post("/emit", async (req, res) => {
  const { type, payload } = req.body;

  const id = await redis.xAdd(STREAM, "*", {
    type,
    payload: JSON.stringify(payload),
    ts: Date.now().toString()
  });

  res.json({ ok: true, id });
});

app.listen(3000, () => console.log("event-bus running on 3000"));
