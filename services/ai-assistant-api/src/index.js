import express from "express";

const app = express();
const port = process.env.PORT || 4100;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "ai-assistant-api", ts: Date.now() });
});

// placeholder admin-only endpoint
app.post("/v1/admin/chat", (req, res) => {
  res.json({
    ok: true,
    service: "ai-assistant-api",
    message: "AI console stub online",
    input: req.body || null
  });
});

app.listen(port, () => {
  console.log(`ai-assistant-api up on :${port}`);
});
