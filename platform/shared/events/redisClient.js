import Redis from 'ioredis';

const config = {
  host:
    process.env.REDIS_HOST ||
    '127.0.0.1',

  port:
    Number(
      process.env.REDIS_PORT ||
      6379
    ),

  retryStrategy: times =>
    Math.min(
      times * 50,
      2000
    )
};

export const pub =
  new Redis(config);

export const sub =
  new Redis(config);

pub.on(
  'connect',
  () =>
    console.log(
      'REDIS PUB CONNECTED'
    )
);

sub.on(
  'connect',
  () =>
    console.log(
      'REDIS SUB CONNECTED'
    )
);

export default {
  pub,
  sub
};
