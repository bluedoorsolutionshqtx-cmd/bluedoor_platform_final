import Redis from 'ioredis';

const redis = new Redis('redis://127.0.0.1:6380');

const TTL_SECONDS = 300; // 5 minutes window

export async function isDuplicate(eventId) {
  if (!eventId) return false;

  const key = `event:${eventId}`;
  const exists = await redis.get(key);

  if (exists) return true;

  await redis.set(key, '1', 'EX', TTL_SECONDS);
  return false;
}
