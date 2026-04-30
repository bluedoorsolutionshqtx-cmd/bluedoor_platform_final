import Redis from 'ioredis';
import crypto from 'crypto';

const redis = new Redis('redis://127.0.0.1:6379');

const STREAM = 'events';
const DLQ = 'events:dlq';
const GROUP = 'control-plane';

const MAX_RETRIES = 3;

function genId(payload) {
  return payload.eventId || crypto.createHash('sha256')
    .update(JSON.stringify(payload))
    .digest('hex');
}

export async function publish(channel, payload) {
  const eventId = genId(payload);

  await redis.xadd(
    STREAM,
    '*',
    'channel', channel,
    'eventId', eventId,
    'retries', '0',
    'payload', JSON.stringify({ ...payload, eventId })
  );
}

async function ensureGroup() {
  try {
    await redis.xgroup('CREATE', STREAM, GROUP, '0', 'MKSTREAM');
  } catch (e) {
    if (!String(e).includes('BUSYGROUP')) throw e;
  }
}

export async function subscribe(serviceName, channel, handler) {
  await ensureGroup();

  while (true) {
    const res = await redis.xreadgroup(
      'GROUP', GROUP, serviceName,
      'BLOCK', 5000,
      'COUNT', 10,
      'STREAMS', STREAM, '>'
    );

    if (!res) continue;

    for (const [, messages] of res) {
      for (const [msgId, fields] of messages) {

        const map = {};
        for (let i = 0; i < fields.length; i += 2) {
          map[fields[i]] = fields[i + 1];
        }

        if (map.channel !== channel) {
          await redis.xack(STREAM, GROUP, msgId);
          continue;
        }

        const retries = parseInt(map.retries || '0', 10);

        try {
          const data = JSON.parse(map.payload);

          await handler(data);

          await redis.xack(STREAM, GROUP, msgId);

        } catch (err) {
          console.error('PROCESSING FAILED:', err);

          if (retries < MAX_RETRIES) {
            const delay = Math.pow(2, retries) * 1000;

            setTimeout(async () => {
              await redis.xadd(
                STREAM,
                '*',
                'channel', map.channel,
                'eventId', map.eventId,
                'retries', String(retries + 1),
                'payload', map.payload
              );
            }, delay);

          } else {
            console.log('SENDING TO DLQ:', map.eventId);

            await redis.xadd(
              DLQ,
              '*',
              'channel', map.channel,
              'eventId', map.eventId,
              'payload', map.payload,
              'error', String(err)
            );
          }

          await redis.xack(STREAM, GROUP, msgId);
        }
      }
    }
  }
}
