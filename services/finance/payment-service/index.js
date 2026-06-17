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
      '[payment-service] postgres connected'
    );
  })
  .catch((err) => {
    console.error(
      '[payment-service] postgres failed:',
      err.message
    );
  });

subscribe(
  'payment-service',
  'invoice.created',
  async (data) => {

    try {

      const paymentId =
        crypto.randomUUID();

      await db.query(
        `
        INSERT INTO payments (
          payment_id,
          invoice_id,
          amount,
          status
        )
        VALUES (
          $1,
          $2,
          $3,
          'received'
        )
        `,
        [
          paymentId,
          data.invoiceId,
          data.amount
        ]
      );

      await publish(
        'payment.received',
        {
          paymentId,
          invoiceId:
            data.invoiceId,
          amount:
            data.amount
        }
      );

      console.log(
        '[payment-service] payment received',
        paymentId
      );

    } catch (err) {

      console.error(
        '[payment-service] failed',
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
  4011,
  () => {
    console.log(
      'payment-service running on 4011'
    );
  }
);
