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
  error => {
    console.error(
      '[redis] error',
      error
    );
  }
);

export default redis;
