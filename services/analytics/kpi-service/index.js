import express from 'express';
import pg from 'pg';

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
      '[kpi-service] postgres connected'
    );
  })
  .catch((err) => {
    console.error(
      '[kpi-service] postgres failed:',
      err.message
    );
  });

async function generateKpis() {

  try {

    const revenue =
      await db.query(
        `
        SELECT
          COALESCE(
            SUM(amount),
            0
          ) AS total_revenue
        FROM revenue_metrics
        `
      );

    const invoices =
      await db.query(
        `
        SELECT COUNT(*)
        AS total_invoices
        FROM invoices
        `
      );

    const payments =
      await db.query(
        `
        SELECT COUNT(*)
        AS total_payments
        FROM payments
        `
      );

    const dispatches =
      await db.query(
        `
        SELECT COUNT(*)
        AS total_dispatches
        FROM dispatch_jobs
        `
      );

    await db.query(
      `
      INSERT INTO kpi_metrics (
        total_revenue,
        total_invoices,
        total_payments,
        total_dispatches
      )
      VALUES (
        $1,
        $2,
        $3,
        $4
      )
      `,
      [
        revenue.rows[0]
          .total_revenue,
        invoices.rows[0]
          .total_invoices,
        payments.rows[0]
          .total_payments,
        dispatches.rows[0]
          .total_dispatches
      ]
    );

    console.log(
      '[kpi-service] KPI snapshot generated'
    );

  } catch (err) {

    console.error(
      '[kpi-service] generation failed',
      err
    );

  }

}

setInterval(
  generateKpis,
  60000
);

app.post(
  '/generate',
  async (req, res) => {

    await generateKpis();

    res.send({
      status:
        'generated'
    });

  }
);

app.get(
  '/latest',
  async (req, res) => {

    const result =
      await db.query(
        `
        SELECT *
        FROM kpi_metrics
        ORDER BY generated_at DESC
        LIMIT 1
        `
      );

    res.send(
      result.rows[0] || {}
    );

  }
);

app.listen(
  4014,
  () => {
    console.log(
      'kpi-service running on 4014'
    );
  }
);
