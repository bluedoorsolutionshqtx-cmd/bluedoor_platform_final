import Redis from 'ioredis';

const redis = new Redis(
  process.env.REDIS_URL ||
  'redis://127.0.0.1:6379'
);

redis.on(
  'connect',
  () => {
    console.log(
      '[redis] connected'
    );
  }
);

redis.on(
  'error',
  (err) => {
    console.error(
      '[redis error]',
      err.message
    );
  }
);

export default redis;
