import express from 'express';
import pg from 'pg';

import {
  subscribe
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
      '[revenue-analytics] postgres connected'
    );
  })
  .catch((err) => {
    console.error(
      '[revenue-analytics] postgres failed:',
      err.message
    );
  });

subscribe(
  'revenue-analytics',
  'payment.received',
  async (data) => {

    try {

      await db.query(
        `
        INSERT INTO revenue_metrics (
          payment_id,
          invoice_id,
          amount
        )
        VALUES (
          $1,
          $2,
          $3
        )
        `,
        [
          data.paymentId,
          data.invoiceId,
          data.amount
        ]
      );

      console.log(
        '[revenue-analytics] revenue recorded',
        data.paymentId
      );

    } catch (err) {

      console.error(
        '[revenue-analytics] failed',
        err
      );

    }

  }
);

app.get(
  '/health',
  (req, res) => {
    res.send({
      service:
        'revenue-analytics',
      status:
        'online'
    });
  }
);

app.listen(
  4012,
  () => {
    console.log(
      'revenue-analytics running on 4012'
    );
  }
);
