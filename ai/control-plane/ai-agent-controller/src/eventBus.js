"use strict";

const { createClient } = require("redis");

const STREAM_KEY = process.env.AI_EVENT_STREAM || "bluedoor:ai:events";
const GROUP_NAME = process.env.AI_EVENT_GROUP || "ai-controller";
const CONSUMER_NAME =
  process.env.AI_EVENT_CONSUMER || `consumer-${process.pid}`;

let pubClient = null;
let subClient = null;
let initialized = false;
let usingRedis = false;
let inMemorySubscribers = [];

async function ensureClients() {
  if (initialized) return;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    initialized = true;
    usingRedis = false;
    console.warn("EventBus running in local fallback mode: REDIS_URL not set");
    return;
  }

  pubClient = createClient({ url: redisUrl });
  subClient = createClient({ url: redisUrl });

  pubClient.on("error", (err) => {
    console.error("Redis pub client error:", err.message);
  });

  subClient.on("error", (err) => {
    console.error("Redis sub client error:", err.message);
  });

  await pubClient.connect();
  await subClient.connect();

  try {
    await pubClient.xGroupCreate(STREAM_KEY, GROUP_NAME, "0", {
      MKSTREAM: true
    });
  } catch (err) {
    if (!String(err.message).includes("BUSYGROUP")) {
      throw err;
    }
  }

  initialized = true;
  usingRedis = true;
}

function normalizeEvent(eventType, payload = {}) {
  return {
    eventType,
    timestamp: new Date().toISOString(),
    payload
  };
}

async function emitEvent(eventType, payload = {}) {
  await ensureClients();

  const event = normalizeEvent(eventType, payload);
  console.log(`EVENT = ${eventType}`);

  if (!usingRedis) {
    for (const sub of inMemorySubscribers) {
      if (sub.eventType === "*" || sub.eventType === eventType) {
        await sub.handler(event);
      }
    }
    return event;
  }

  await pubClient.xAdd(STREAM_KEY, "*", {
    eventType: event.eventType,
    timestamp: event.timestamp,
    payload: JSON.stringify(event.payload)
  });

  return event;
}

async function subscribe(eventType, handler) {
  await ensureClients();

  if (!usingRedis) {
    inMemorySubscribers.push({ eventType, handler });
    return;
  }

  const loop = async () => {
    while (true) {
      try {
        const response = await subClient.xReadGroup(
          GROUP_NAME,
          CONSUMER_NAME,
          [{ key: STREAM_KEY, id: ">" }],
          { COUNT: 10, BLOCK: 5000 }
        );

        if (!response) continue;

        for (const stream of response) {
          for (const message of stream.messages) {
            const values = message.message;
            const event = {
              eventType: values.eventType,
              timestamp: values.timestamp,
              payload: values.payload ? JSON.parse(values.payload) : {}
            };

            if (eventType === "*" || event.eventType === eventType) {
              await handler(event);
            }

            await subClient.xAck(STREAM_KEY, GROUP_NAME, message.id);
          }
        }
      } catch (err) {
        console.error("Redis event loop error:", err.message);
      }
    }
  };

  loop().catch((err) => {
    console.error("Event subscription crashed:", err.message);
  });
}

module.exports = {
  emitEvent,
  subscribe
};
