import { createClient } from "redis";
import fetch from "node-fetch";

const redis = createClient({
  url: "redis://127.0.0.1:6379"
});

await redis.connect();

const STREAM = "bd.events";
const GROUP = "control-plane";
const CONSUMER = "worker-1";

console.log("Worker started...");

while (true) {
  try {
    const res = await redis.xReadGroup(
      GROUP,
      CONSUMER,
      [{ key: STREAM, id: ">" }],
      { COUNT: 10, BLOCK: 5000 }
    );

    if (!res) continue;

    for (const stream of res) {
      for (const msg of stream.messages) {
        const data = msg.message;

        const event = data.type;
        const payload = JSON.parse(data.payload || "{}");

        console.log("EVENT RECEIVED:", event, payload);

        // send to execution service
        await fetch("http://localhost:3004/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event,
            payload
          })
        });

        // acknowledge message
        await redis.xAck(STREAM, GROUP, msg.id);
      }
    }
  } catch (err) {
    console.error("Worker error:", err);
  }
}
