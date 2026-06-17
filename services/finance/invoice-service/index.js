import express from 'express';
import pg from 'pg';
import crypto from 'crypto';

import {
  subscribe,
  publish
} from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/platform/shared/events/eventBus.js';

const app = express();

app.use(express.json());

const db = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres@127.0.0.1:5432/bluedoor'
});

db.query('SELECT NOW()')
  .then(() => {
    console.log(
      '[invoice-service] postgres connected'
    );
  })
  .catch((err) => {
    console.error(
      '[invoice-service] postgres failed:',
      err.message
    );
  });

subscribe(
  'invoice-service',
  'job.completed',
  async (data) => {

    const invoiceId =
      crypto.randomUUID();

    const jobId =
      data.jobId;

    const clientId =
      data.clientId ||
      null;

    const amount =
      Number(
        data.amount ||
        100.00
      );

    try {

      await db.query(
        `
        INSERT INTO invoices (
          invoice_id,
          job_id,
          client_id,
          amount,
          status
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          'pending'
        )
        `,
        [
          invoiceId,
          jobId,
          clientId,
          amount
        ]
      );

      await publish(
        'invoice.created',
        {
          ...data,
          invoiceId,
          amount,
          invoiceStatus:
            'pending',
          createdAt:
            new Date()
              .toISOString()
        }
      );

      console.log(
        '[invoice-service] invoice created',
        invoiceId
      );

    } catch (err) {

      console.error(
        '[invoice-service] failed',
        err
      );

    }
  }
);

app.get(
  '/health',
  (req, res) => {
    res.send({
      status: 'ok'
    });
  }
);

app.listen(
  3014,
  () => {
    console.log(
      'invoice-service running on 3014'
    );
  }
);
