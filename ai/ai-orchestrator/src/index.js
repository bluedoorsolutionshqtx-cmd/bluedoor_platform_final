
import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const RISK_URL = process.env.RISK_URL;
const POLICY_URL = process.env.POLICY_URL;
const APPROVAL_URL = process.env.APPROVAL_URL;
const EXECUTION_URL = process.env.EXECUTION_URL;
const MEMORY_URL = process.env.MEMORY_URL;

app.post("/action", async (req, res) => {
  try {
    const action = req.body;

    const riskRes = await axios.post(`${RISK_URL}/score`, { action });
    const riskScore = riskRes.data.riskScore;

    const policyRes = await axios.post(`${POLICY_URL}/evaluate`, { riskScore });
    const decision = policyRes.data.decision;

    if (decision === "deny") {
      return res.json({ status: "denied" });
    }

    if (decision === "approval_required") {
      const approval = await axios.post(`${APPROVAL_URL}/request`, { action });
      return res.json({ status: "pending", approval: approval.data });
    }

    const execRes = await axios.post(`${EXECUTION_URL}/execute`, { action });

    await axios.post(`${MEMORY_URL}/store`, {
      action,
      outcome: execRes.data
    });

    res.json({
      status: "executed",
      result: execRes.data
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("orchestrator running"));
