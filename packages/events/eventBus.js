import Redis from 'ioredis';

let redis;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);

  redis.on('error', (err) => {
    console.log('Redis error:', err.message);
  });
} else {
  console.log('Redis disabled (no REDIS_URL)');
  redis = {
    publish: async () => {},
    subscribe: () => {},
    on: () => {}
  };
}

export const publish = async (channel, payload) => {
  await redis.publish(channel, JSON.stringify(payload));
};

export const subscribe = (channel, handler) => {
  const sub = new Redis(process.env.REDIS_URL);

  sub.subscribe(channel);

  sub.on('message', async (ch, msg) => {
    if (ch === channel) {
      try {
        const data = JSON.parse(msg);
        await handler(data);
      } catch (e) {
        console.error('event error', e);
      }
    }
  });
};

export default redis;
