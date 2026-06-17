import express from 'express';
import pg from 'pg';

const app = express();

const db = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres@127.0.0.1:5432/bluedoor'
});

await db.query(`
CREATE TABLE IF NOT EXISTS forecasting_metrics (
  id BIGSERIAL PRIMARY KEY,
  metric_date DATE NOT NULL,
  jobs_completed INTEGER NOT NULL,
  revenue NUMERIC(12,2) NOT NULL,
  projected_jobs INTEGER NOT NULL,
  projected_revenue NUMERIC(12,2) NOT NULL,
  generated_at TIMESTAMP DEFAULT NOW()
)
`);

console.log(
  '[forecasting-service] postgres connected'
);

async function generateForecast() {

  const jobs =
    await db.query(`
      SELECT
        COUNT(*) AS total
      FROM operations_metrics
      WHERE status = 'completed'
      AND recorded_at >=
        NOW() - INTERVAL '30 days'
    `);

  const revenue =
    await db.query(`
      SELECT
        COALESCE(
          SUM(amount),
          0
        ) AS total
      FROM revenue_metrics
      WHERE recorded_at >=
        NOW() - INTERVAL '30 days'
    `);

  const completedJobs =
    Number(
      jobs.rows[0].total || 0
    );

  const totalRevenue =
    Number(
      revenue.rows[0].total || 0
    );

  const projectedJobs =
    Math.round(
      completedJobs * 1.10
    );

  const projectedRevenue =
    Number(
      (
        totalRevenue * 1.10
      ).toFixed(2)
    );

  await db.query(
    `
    INSERT INTO forecasting_metrics (
      metric_date,
      jobs_completed,
      revenue,
      projected_jobs,
      projected_revenue
    )
    VALUES (
      CURRENT_DATE,
      $1,
      $2,
      $3,
      $4
    )
    `,
    [
      completedJobs,
      totalRevenue,
      projectedJobs,
      projectedRevenue
    ]
  );

  console.log(
    '[forecast generated]',
    projectedJobs,
    projectedRevenue
  );
}

app.post(
  '/forecast/run',
  async (req, res) => {

    try {

      await generateForecast();

      res.send({
        status:
          'forecast_generated'
      });

    } catch (err) {

      console.error(err);

      res.status(500).send({
        error:
          err.message
      });

    }

  }
);

app.get(
  '/forecast/latest',
  async (req, res) => {

    const result =
      await db.query(`
        SELECT *
        FROM forecasting_metrics
        ORDER BY generated_at DESC
        LIMIT 1
      `);

    res.send(
      result.rows[0] || {}
    );
  }
);

app.get(
  '/health',
  (req, res) => {
    res.send({
      service:
        'forecasting-service',
      status:
        'online'
    });
  }
);

app.listen(
  4019,
  () => {
    console.log(
      'forecasting-service running on 4019'
    );
  }
);
