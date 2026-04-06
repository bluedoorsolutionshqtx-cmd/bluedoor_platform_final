import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

app.post("/execute", async (req, res) => {
  const { action } = req.body;

  const result = { success: true, action };

  await axios.post(process.env.AUDIT_URL + "/log", {
    action,
    result
  });

  res.json(result);
});

app.listen(3000, () => console.log("execution-service running"));
