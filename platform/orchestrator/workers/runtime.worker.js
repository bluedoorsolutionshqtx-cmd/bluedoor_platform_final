import redis from '../streams/redisClient.js';

const worker = process.argv[2];

if (!worker) {
  console.error('[worker-runtime] missing worker name');
  process.exit(1);
}

const module = await import(`./${worker}.worker.js`);

const STREAM = `worker.${worker}.worker`;
const GROUP = `${worker}-group`;
const CONSUMER = `${worker}-consumer`;

async function ensureGroup() {
  try {
    await redis.xgroup(
      'CREATE',
      STREAM,
      GROUP,
      '0',
      'MKSTREAM'
    );

    console.log(
      '[worker-group-created]',
      STREAM
    );
  } catch (err) {
    if (!err.message.includes('BUSYGROUP')) {
      throw err;
    }
  }
}

async function consume() {
  await ensureGroup();

  console.log(
    '[worker-online]',
    worker,
    STREAM
  );

  while (true) {
    try {
      const response =
        await redis.xreadgroup(
          'GROUP',
          GROUP,
          CONSUMER,
          'BLOCK',
          5000,
          'COUNT',
          10,
          'STREAMS',
          STREAM,
          '>'
        );

      if (!response) {
        continue;
      }

      for (const [, messages] of response) {
        for (const message of messages) {
          const [id, fields] = message;

          const payload =
            JSON.parse(fields[1]);

          console.log(
            '[worker]',
            worker,
            payload.type
          );

          await module.execute(
            payload
          );

          await redis.xack(
            STREAM,
            GROUP,
            id
          );
        }
      }
    } catch (err) {
      console.error(
        '[worker-error]',
        worker,
        err
      );
    }
  }
}

consume().catch(console.error);
