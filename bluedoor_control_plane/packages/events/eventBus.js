import Redis from 'ioredis';
import crypto from 'crypto';

const pub = new Redis({
  host: '127.0.0.1',
  port: 6379,
});

const sub = new Redis({
  host: '127.0.0.1',
  port: 6379,
});

const CHANNEL = 'bluedoor.control_plane';

export const publishEvent = async (type, payload) => {
  const event = {
    id: crypto.randomUUID(),
    type,
    payload,
    timestamp: new Date().toISOString(),
  };

  await pub.publish(CHANNEL, JSON.stringify(event));
};

export const subscribeEvents = (handler) => {
  sub.subscribe(CHANNEL);

  sub.on('message', async (_, message) => {
    try {
      const event = JSON.parse(message);
      await handler(event);
    } catch (err) {
      console.error('[eventBus] parse error:', err);
    }
  });
};
