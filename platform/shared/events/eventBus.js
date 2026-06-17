import Redis from 'ioredis';
import crypto from 'crypto';

const redis = new Redis(
  process.env.REDIS_URL ||
  'redis://127.0.0.1:6380'
);

const STREAM = 'events';
const DLQ = 'events:dlq';

const MAX_RETRIES = 3;

function genId(payload) {
  return (
    payload.eventId ||
    crypto
      .createHash('sha256')
      .update(JSON.stringify(payload))
      .digest('hex')
  );
}

export async function publish(
  channel,
  payload
) {
  const eventId =
    genId(payload);

  await redis.xadd(
    STREAM,
    '*',
    'channel',
    channel,
    'eventId',
    eventId,
    'retries',
    '0',
    'payload',
    JSON.stringify({
      ...payload,
      eventId
    })
  );
}

async function ensureGroup(
  groupName
) {
  try {
    await redis.xgroup(
      'CREATE',
      STREAM,
      groupName,
      '0',
      'MKSTREAM'
    );
  } catch (e) {
    if (
      !String(e).includes(
        'BUSYGROUP'
      )
    ) {
      throw e;
    }
  }
}

export async function subscribe(
  serviceName,
  channel,
  handler
) {
  const groupName =
    serviceName;

  await ensureGroup(
    groupName
  );

  while (true) {
    const res =
      await redis.xreadgroup(
        'GROUP',
        groupName,
        serviceName,
        'BLOCK',
        5000,
        'COUNT',
        10,
        'STREAMS',
        STREAM,
        '>'
      );

    if (!res) {
      continue;
    }

    for (const [, messages] of res) {
      for (const [
        msgId,
        fields
      ] of messages) {

        const map = {};

        for (
          let i = 0;
          i < fields.length;
          i += 2
        ) {
          map[
            fields[i]
          ] =
            fields[
              i + 1
            ];
        }

        if (
          map.channel !==
          channel
        ) {
          await redis.xack(
            STREAM,
            groupName,
            msgId
          );

          continue;
        }

        const retries =
          parseInt(
            map.retries ||
            '0',
            10
          );

        try {
          const data =
            JSON.parse(
              map.payload
            );

          await handler(
            data
          );

          await redis.xack(
            STREAM,
            groupName,
            msgId
          );

        } catch (err) {

          console.error(
            'PROCESSING FAILED:',
            err
          );

          if (
            retries <
            MAX_RETRIES
          ) {

            const delay =
              Math.pow(
                2,
                retries
              ) * 1000;

            setTimeout(
              async () => {
                await redis.xadd(
                  STREAM,
                  '*',
                  'channel',
                  map.channel,
                  'eventId',
                  map.eventId,
                  'retries',
                  String(
                    retries + 1
                  ),
                  'payload',
                  map.payload
                );
              },
              delay
            );

          } else {

            await redis.xadd(
              DLQ,
              '*',
              'channel',
              map.channel,
              'eventId',
              map.eventId,
              'payload',
              map.payload,
              'error',
              String(err)
            );
          }

          await redis.xack(
            STREAM,
            groupName,
            msgId
          );
        }
      }
    }
  }
}
