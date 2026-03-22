"use strict";

const { createClient } = require("redis");

const REDIS_URL = process.env.REDIS_URL;
const AI_EVENT_STREAM = process.env.AI_EVENT_STREAM || "bluedoor:ai:events";
const AI_EVENT_GROUP = process.env.AI_EVENT_GROUP || "ai-control-plane";
const AI_EVENT_CONSUMER =
  process.env.AI_EVENT_CONSUMER || `consumer-${process.pid}`;

if (!REDIS_URL) {
  throw new Error("REDIS_URL is not set");
}

let pubClient;
let subClient;
const handlers = new Map();

async function ensureClients() {
  if (!pubClient) {
    pubClient = createClient({ url: REDIS_URL });
    pubClient.on("error", (err) => {
      console.error("Redis pub client error:", err.message);
    });
    await pubClient.connect();
  }

  if (!subClient) {
    subClient = createClient({ url: REDIS_URL });
    subClient.on("error", (err) => {
      console.error("Redis sub client error:", err.message);
    });
    await subClient.connect();
  }
}

async function ensureGroup() {
  await ensureClients();

  try {
    await pubClient.xGroupCreate(
      AI_EVENT_STREAM,
      AI_EVENT_GROUP,
      "0",
      { MKSTREAM: true }
    );
  } catch (err) {
    if (!String(err.message).includes("BUSYGROUP")) {
      throw err;
    }
  }
}

function serializeEvent(eventType, payload) {
  return {
    eventType,
    timestamp: new Date().toISOString(),
    payload: JSON.stringify(payload || {})
  };
}

function deserializeMessage(messageId, fields) {
  const eventType = fields.eventType;
  const timestamp = fields.timestamp;
  let payload = {};

  try {
    payload = fields.payload ? JSON.parse(fields.payload) : {};
  } catch (err) {
    console.error("Failed to parse event payload:", err.message);
  }

  return {
    id: messageId,
    eventType,
    timestamp,
    ...payload
  };
}

async function emitEvent(eventType, payload = {}) {
  await ensureGroup();

  const messageId = await pubClient.xAdd(
    AI_EVENT_STREAM,
    "*",
    serializeEvent(eventType, payload)
  );

  console.log(`EVENT = ${eventType}`);
  return messageId;
}

async function subscribe(eventType, handler) {
  if (!eventType || typeof handler !== "function") {
    throw new Error("subscribe requires eventType and handler");
  }

  await ensureGroup();

  if (!handlers.has(eventType)) {
    handlers.set(eventType, []);
  }

  handlers.get(eventType).push(handler);

  const loop = async () => {
    while (true) {
      try {
        const response = await subClient.xReadGroup(
          AI_EVENT_GROUP,
          AI_EVENT_CONSUMER,
          [{ key: AI_EVENT_STREAM, id: ">" }],
          { COUNT: 10, BLOCK: 5000 }
        );

        if (!response) {
          continue;
        }

        for (const stream of response) {
          for (const message of stream.messages) {
            const event = deserializeMessage(message.id, message.message);

            if (event.eventType !== eventType) {
              await subClient.xAck(
                AI_EVENT_STREAM,
                AI_EVENT_GROUP,
                message.id
              );
              continue;
            }

            const eventHandlers = handlers.get(eventType) || [];

            try {
              for (const fn of eventHandlers) {
                await fn(event);
              }

              await subClient.xAck(
                AI_EVENT_STREAM,
                AI_EVENT_GROUP,
                message.id
              );
            } catch (err) {
              console.error(
                `Event handler failed for ${eventType}:`,
                err.message
              );
            }
          }
        }
      } catch (err) {
        console.error("Redis subscription loop error:", err.message);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  };

  loop().catch((err) => {
    console.error("Subscription worker crashed:", err.message);
  });
}

module.exports = {
  emitEvent,
  subscribe,
  ensureGroup
};
