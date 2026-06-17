import express from 'express';

import multer from 'multer';
import path from 'path';
import fs from 'fs';

import {
  pub
} from '../../../platform/shared/events/redisClient.js';

import pg from 'pg';
import { publish } from '../../../platform/shared/events/eventBus.js';
import { saveAudit } from './audit/saveAudit.js';
import {
  recordLeadEvent,
  recordClientEvent,
  recordPropertyEvent
} from './timeline/services/timelineService.js';
import timelineRoutes from './timeline/routes/timelineRoutes.js';
import noteRoutes from './notes/routes/noteRoutes.js';
import taskRoutes from './tasks/routes/taskRoutes.js';
import analyticsRoutes from './analytics/routes/analyticsRoutes.js';

const { Pool } = pg;

const app = express();

app.use(express.json());
app.use(
  '/api',
  timelineRoutes
);

app.use(
  '/api',
  noteRoutes
);

app.use(
  '/api',
  taskRoutes
);

app.use(
  '/api',
  analyticsRoutes
);

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres@127.0.0.1:5432/bluedoor'
});

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT NOW()');

    
const incidentsByDay = {};

incidents.forEach(row=>{

  if(!row.created_at){
    return;
  }

  const day =
    new Date(row.created_at)
      .toISOString()
      .split('T')[0];

  incidentsByDay[day] =
    (incidentsByDay[day] || 0) + 1;

});

const incidentTypes = {};

incidents.forEach(row=>{

  const type =
    row.incident_type ||
    'unknown';

  incidentTypes[type] =
    (incidentTypes[type] || 0) + 1;

});

const severityDistribution = {

  high,
  medium,
  low

};

const executiveSummary = {

  totalIncidents: total,

  activeIncidents:
    open +
    acknowledged,

  resolvedIncidents:
    resolved,

  resolutionRate:
    Number(
      resolutionRate.toFixed(2)
    ),

  mttrHours:
    Number(
      mttr.toFixed(2)
    )

};

res.json({

      service: 'client-crm',
      status: 'online'
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

/*
|--------------------------------------------------------------------------
| LEADS
|--------------------------------------------------------------------------
*/

app.post('/api/leads', async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      source,
      notes
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO crm_leads
      (
        first_name,
        last_name,
        email,
        phone,
        source,
        notes
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6
      )
      RETURNING *
      `,
      [
        first_name,
        last_name,
        email,
        phone,
        source,
        notes
      ]
    );

    const lead = result.rows[0];

    await publish(
      'crm.lead.created',
      lead
    );

    await saveAudit(
      lead.id,
      'crm.lead.created',
      lead
    );

await recordLeadEvent(
  lead.id,
  'crm.lead.created',
  lead
);

    res.status(201).json(lead);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.get('/api/leads', async (req, res) => {
  try {

    const search =
      req.query.search || '';

    const result =
      await pool.query(
        `
        SELECT *
        FROM crm_leads
        WHERE
          first_name ILIKE $1 OR
          last_name ILIKE $1 OR
          email ILIKE $1 OR
          phone ILIKE $1 OR
          status ILIKE $1
        ORDER BY created_at DESC
        `,
        [
          `%${search}%`
        ]
      );

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

/*
|--------------------------------------------------------------------------
| CLIENTS
|--------------------------------------------------------------------------
*/

app.post('/api/clients', async (req, res) => {
  try {
    const {
      lead_id,
      company_name,
      first_name,
      last_name,
      email,
      phone
    } = req.body;

    const result =
      await pool.query(
        `
        INSERT INTO crm_clients
        (
          lead_id,
          company_name,
          first_name,
          last_name,
          email,
          phone
        )
        VALUES
        (
          $1,$2,$3,$4,$5,$6
        )
        RETURNING *
        `,
        [
          lead_id,
          company_name,
          first_name,
          last_name,
          email,
          phone
        ]
      );

    const client = result.rows[0];

    await publish(
      'crm.client.created',
      client
    );

    await saveAudit(
      client.id,
      'crm.client.created',
      client
    );

await recordClientEvent(
  client.id,
  'crm.client.created',
  client
);

    res.status(201).json(client);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.get('/api/clients', async (req, res) => {
  try {

    const search =
      req.query.search || '';

    const result =
      await pool.query(
        `
        SELECT *
        FROM crm_clients
        WHERE
          first_name ILIKE $1 OR
          last_name ILIKE $1 OR
          company_name ILIKE $1 OR
          email ILIKE $1 OR
          phone ILIKE $1 OR
          status ILIKE $1
        ORDER BY created_at DESC
        `,
        [
          `%${search}%`
        ]
      );

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

/*
|--------------------------------------------------------------------------
| PROPERTIES
|--------------------------------------------------------------------------
*/

app.post('/api/properties', async (req, res) => {
  try {
    const {
      client_id,
      property_name,
      address_1,
      address_2,
      city,
      state,
      postal_code,
      acreage,
      notes
    } = req.body;

    const result =
      await pool.query(
        `
        INSERT INTO crm_properties
        (
          client_id,
          property_name,
          address_1,
          address_2,
          city,
          state,
          postal_code,
          acreage,
          notes
        )
        VALUES
        (
          $1,$2,$3,$4,$5,$6,$7,$8,$9
        )
        RETURNING *
        `,
        [
          client_id,
          property_name,
          address_1,
          address_2,
          city,
          state,
          postal_code,
          acreage,
          notes
        ]
      );

    const property = result.rows[0];

    await publish(
      'crm.property.created',
      property
    );

    await saveAudit(
      property.id,
      'crm.property.created',
      property
    );

await recordPropertyEvent(
  property.id,
  'crm.property.created',
  property
);

    res.status(201).json(property);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.get('/api/properties', async (_req, res) => {
  try {
    const result =
      await pool.query(`
        SELECT *
        FROM crm_properties
        ORDER BY created_at DESC
      `);

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

/*
|--------------------------------------------------------------------------
| LEAD CONVERSION
|--------------------------------------------------------------------------
*/

app.post('/api/leads/:id/convert', async (req, res) => {
  try {

    const leadId =
      req.params.id;

    const leadResult =
      await pool.query(
        `
        SELECT *
        FROM crm_leads
        WHERE id = $1
        `,
        [leadId]
      );

    if (
      leadResult.rows.length === 0
    ) {
      return res.status(404).json({
        error: 'Lead not found'
      });
    }

    const lead =
      leadResult.rows[0];

    const clientResult =
      await pool.query(
        `
        INSERT INTO crm_clients
        (
          lead_id,
          first_name,
          last_name,
          email,
          phone
        )
        VALUES
        (
          $1,$2,$3,$4,$5
        )
        RETURNING *
        `,
        [
          lead.id,
          lead.first_name,
          lead.last_name,
          lead.email,
          lead.phone
        ]
      );

    const client =
      clientResult.rows[0];

    await pool.query(
      `
      UPDATE crm_leads
      SET
        status = 'converted',
        updated_at = NOW()
      WHERE id = $1
      `,
      [lead.id]
    );

    await publish(
      'crm.client.created',
      client
    );

    await saveAudit(
      client.id,
      'crm.client.created',
      client
    );

await recordLeadEvent(
  lead.id,
  'crm.lead.converted',
  {
    leadId: lead.id,
    clientId: client.id
  }
);

    await saveAudit(
      lead.id,
      'crm.lead.converted',
      {
        leadId: lead.id,
        clientId: client.id
      }
    );

    res.status(201).json({
      leadId: lead.id,
      client
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

/*
|--------------------------------------------------------------------------
| STATUS MANAGEMENT
|--------------------------------------------------------------------------
*/

app.patch('/api/leads/:id/status', async (req, res) => {
  try {

    const result =
      await pool.query(
        `
        UPDATE crm_leads
        SET
          status = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING *
        `,
        [
          req.body.status,
          req.params.id
        ]
      );

    if (
      result.rows.length === 0
    ) {
      return res.status(404).json({
        error: 'Lead not found'
      });
    }

    const lead =
      result.rows[0];

    await publish(
      'crm.lead.status.changed',
      lead
    );

    await saveAudit(
      lead.id,
      'crm.lead.status.changed',
      lead
    );

await recordLeadEvent(
  lead.id,
  'crm.lead.status.changed',
  lead
);

    res.json(lead);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.patch('/api/clients/:id/status', async (req, res) => {
  try {

    const result =
      await pool.query(
        `
        UPDATE crm_clients
        SET
          status = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING *
        `,
        [
          req.body.status,
          req.params.id
        ]
      );

    if (
      result.rows.length === 0
    ) {
      return res.status(404).json({
        error: 'Client not found'
      });
    }

    const client =
      result.rows[0];

    await publish(
      'crm.client.status.changed',
      client
    );

    await saveAudit(
      client.id,
      'crm.client.status.changed',
      client
    );

await recordClientEvent(
  client.id,
  'crm.client.status.changed',
  client
);

    res.json(client);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});





async function writeIncidentAudit(
  incidentId,
  eventType,
  user
) {

  try {

    await pool.query(
      `
      INSERT INTO workflow_audit (
        workflow_id,
        event_type,
        payload,
        created_at
      )
      VALUES (
        $1,
        $2,
        $3,
        NOW()
      )
      `,
      [
        incidentId,
        eventType,
        JSON.stringify({
          incidentId,
          user
        })
      ]
    );

  } catch (err) {

    console.error(
      'INCIDENT AUDIT ERROR',
      err.message
    );

  }

}


async function writeWorkflowAudit(
  jobId,
  oldStatus,
  newStatus
) {

  try {

    await pool.query(
      `
      INSERT INTO workflow_audit (
        workflow_id,
        event_type,
        payload,
        created_at
      )
      VALUES (
        $1,
        $2,
        $3,
        NOW()
      )
      `,
      [
        jobId,
        'job.status.changed',
        JSON.stringify({
          jobId,
          oldStatus,
          newStatus
        })
      ]
    );

  } catch (err) {

    console.error(
      'AUDIT ERROR',
      err.message
    );

  }

}


const port =
  process.env.PORT || 4004;



app.get(
  '/api/invoices',
  async (req, res) => {

    try {

      const result =
        await pool.query(`
          SELECT
            invoice_id,
            job_id,
            client_id,
            amount,
            status,
            created_at
          FROM invoices
          ORDER BY created_at DESC
        `);

      res.json(
        result.rows
      );

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error:'invoice query failed'
      });

    }

  }
);

app.get(
  '/api/invoices/client/:clientId',
  async (req, res) => {

    try {

      const result =
        await pool.query(
          `
          SELECT
            invoice_id,
            job_id,
            client_id,
            amount,
            status,
            created_at
          FROM invoices
          WHERE client_id = $1::uuid
          ORDER BY created_at DESC
          `,
          [
            req.params.clientId
          ]
        );

      res.json(
        result.rows
      );

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error:'client invoice query failed'
      });

    }

  }
);




app.get(
  '/api/payments',
  async (req, res) => {

    try {

      const result =
        await pool.query(`
          SELECT
            payment_id,
            invoice_id,
            amount,
            status,
            received_at
          FROM payments
          ORDER BY received_at DESC
        `);

      res.json(
        result.rows
      );

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error:'payment query failed'
      });

    }

  }
);

app.get(
  '/api/payments/client/:clientId',
  async (req, res) => {

    try {

      const result =
        await pool.query(
          `
          SELECT
            p.payment_id,
            p.invoice_id,
            p.amount,
            p.status,
            p.received_at,
            i.client_id
          FROM payments p
          LEFT JOIN invoices i
            ON p.invoice_id = i.invoice_id
          WHERE i.client_id = $1
          ORDER BY p.received_at DESC
          `,
          [
            req.params.clientId
          ]
        );

      res.json(
        result.rows
      );

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error:'client payment query failed'
      });

    }

  }
);




app.get(
  '/api/jobs',
  async (req, res) => {

    try {

      const result =
        await pool.query(
          `
          SELECT
            job_id,
            client_id,
            property_id,
            current_stage,
            status,
            updated_at
          FROM job_lifecycle
          ORDER BY updated_at DESC
          `
        );

      res.json(
        result.rows
      );

    } catch (err) {

      res.status(500).json({
        error: err.message
      });

    }

  }
);




app.get(
  '/api/crew-locations',
  async (req, res) => {

    try {

      const result =
        await pool.query(
          `
          SELECT
            crew_id,
            latitude,
            longitude,
            status,
            updated_at
          FROM crew_locations
          ORDER BY crew_id
          `
        );

      res.json(
        result.rows
      );

    } catch (err) {

      res.status(500).json({
        error: err.message
      });

    }

  }
);




app.get(
  '/api/dispatch-jobs',
  async (req, res) => {

    try {

      const result =
        await pool.query(
          `
          SELECT
            job_id,
            route_id,
            crew_id,
            status,
            dispatched_at
          FROM dispatch_jobs
          ORDER BY dispatched_at DESC
          `
        );

      res.json(
        result.rows
      );

    } catch (err) {

      res.status(500).json({
        error: err.message
      });

    }

  }
);




app.put(
  '/api/dispatch-jobs/:jobId/status',
  async (req, res) => {

    try {

      const current =
        await pool.query(
          `
          SELECT status
          FROM dispatch_jobs
          WHERE job_id = $1
          `,
          [
            req.params.jobId
          ]
        );

      const oldStatus =
        current.rows[0]?.status;

      const result =
        await pool.query(
          `
          UPDATE dispatch_jobs
          SET status = $1
          WHERE job_id = $2
          RETURNING *
          `,
          [
            req.body.status,
            req.params.jobId
          ]
        );

      await writeWorkflowAudit(
        req.params.jobId,
        oldStatus,
        req.body.status
      );

      res.json(
        result.rows[0]
      );

    } catch (err) {

      res.status(500).json({
        error: err.message
      });

    }

  }
);




app.get(
  '/api/jobs/:jobId',
  async (req, res) => {

    try {

      const result =
        await pool.query(
          `
          SELECT
            job_id,
            route_id,
            crew_id,
            status,
            dispatched_at
          FROM dispatch_jobs
          WHERE job_id = $1
          `,
          [
            req.params.jobId
          ]
        );

      if (
        result.rows.length === 0
      ) {

        return res
          .status(404)
          .json({
            error:'job not found'
          });

      }

      res.json(
        result.rows[0]
      );

    } catch (err) {

      res.status(500).json({
        error:err.message
      });

    }

  }
);

app.get(
  '/api/jobs/:jobId/invoice',
  async (req, res) => {

    try {

      const result =
        await pool.query(
          `
          SELECT *
          FROM invoices
          WHERE job_id = $1
          LIMIT 1
          `,
          [
            req.params.jobId
          ]
        );

      res.json(
        result.rows[0] || null
      );

    } catch (err) {

      res.status(500).json({
        error:err.message
      });

    }

  }
);

app.get(
  '/api/jobs/:jobId/payment',
  async (req, res) => {

    try {

      const invoice =
        await pool.query(
          `
          SELECT invoice_id
          FROM invoices
          WHERE job_id = $1
          LIMIT 1
          `,
          [
            req.params.jobId
          ]
        );

      if (
        invoice.rows.length === 0
      ) {

        return res.json(null);

      }

      const payment =
        await pool.query(
          `
          SELECT *
          FROM payments
          WHERE invoice_id = $1
          ORDER BY received_at DESC
          LIMIT 1
          `,
          [
            invoice.rows[0]
              .invoice_id
          ]
        );

      res.json(
        payment.rows[0] || null
      );

    } catch (err) {

      res.status(500).json({
        error:err.message
      });

    }

  }
);




app.get(
  '/api/jobs/:jobId/client',
  async (req, res) => {

    try {

      const invoice =
        await pool.query(
          `
          SELECT client_id
          FROM invoices
          WHERE job_id = $1
          LIMIT 1
          `,
          [
            req.params.jobId
          ]
        );

      if (
        invoice.rows.length === 0
      ) {

        return res.json(null);

      }

      const client =
        await pool.query(
          `
          SELECT *
          FROM crm_clients
          WHERE id = $1::uuid
          LIMIT 1
          `,
          [
            invoice.rows[0]
              .client_id
          ]
        );

      res.json(
        client.rows[0] || null
      );

    } catch (err) {

      res.status(500).json({
        error:err.message
      });

    }

  }
);

app.get(
  '/api/jobs/:jobId/property',
  async (req, res) => {

    try {

      const invoice =
        await pool.query(
          `
          SELECT client_id
          FROM invoices
          WHERE job_id = $1
          LIMIT 1
          `,
          [
            req.params.jobId
          ]
        );

      if (
        invoice.rows.length === 0
      ) {

        return res.json(null);

      }

      const property =
        await pool.query(
          `
          SELECT *
          FROM crm_properties
          WHERE client_id = $1::uuid
          ORDER BY id DESC
          LIMIT 1
          `,
          [
            invoice.rows[0]
              .client_id
          ]
        );

      res.json(
        property.rows[0] || null
      );

    } catch (err) {

      res.status(500).json({
        error:err.message
      });

    }

  }
);




app.put(
  '/api/jobs/:jobId/status',
  async (req, res) => {

    try {

      const current =
        await pool.query(
          `
          SELECT status
          FROM dispatch_jobs
          WHERE job_id = $1
          `,
          [
            req.params.jobId
          ]
        );

      const oldStatus =
        current.rows[0]?.status;

      const result =
        await pool.query(
          `
          UPDATE dispatch_jobs
          SET status = $1
          WHERE job_id = $2
          RETURNING *
          `,
          [
            req.body.status,
            req.params.jobId
          ]
        );

      await writeWorkflowAudit(
        req.params.jobId,
        oldStatus,
        req.body.status
      );

      if (
        result.rows.length === 0
      ) {

        return res.status(404).json({
          error:'job not found'
        });

      }

      res.json(
        result.rows[0]
      );

    } catch (err) {

      res.status(500).json({
        error:err.message
      });

    }

  }
);




app.get(
  '/api/jobs/:jobId/audit',
  async (req, res) => {

    try {

      const result =
        await pool.query(
          `
          SELECT
            workflow_id,
            event_type,
            payload,
            created_at
          FROM workflow_audit
          WHERE workflow_id = $1
          ORDER BY created_at DESC
          `,
          [
            req.params.jobId
          ]
        );

      res.json(
        result.rows
      );

    } catch (err) {

      res.status(500).json({
        error:err.message
      });

    }

  }
);




app.get(
  '/api/dashboard/metrics',
  async (req, res) => {

    try {

      const activeJobs =
        await pool.query(
          `
          SELECT COUNT(*)
          FROM dispatch_jobs
          WHERE status NOT IN (
            'completed',
            'paid'
          )
          `
        );

      const completedJobs =
        await pool.query(
          `
          SELECT COUNT(*)
          FROM dispatch_jobs
          WHERE status='completed'
          `
        );

      const invoices =
        await pool.query(
          `
          SELECT
            COALESCE(
              SUM(amount),
              0
            ) AS total
          FROM invoices
          `
        );

      const payments =
        await pool.query(
          `
          SELECT
            COALESCE(
              SUM(amount),
              0
            ) AS total
          FROM payments
          `
        );

      const pendingInvoices =
        await pool.query(
          `
          SELECT COUNT(*)
          FROM invoices
          WHERE status='pending'
          `
        );

      const crews =
        await pool.query(
          `
          SELECT COUNT(*)
          FROM crew_locations
          `
        );

      res.json({

        activeJobs:
          Number(
            activeJobs.rows[0]
              .count
          ),

        completedJobs:
          Number(
            completedJobs.rows[0]
              .count
          ),

        revenue:
          Number(
            invoices.rows[0]
              .total
          ),

        paymentsReceived:
          Number(
            payments.rows[0]
              .total
          ),

        pendingInvoices:
          Number(
            pendingInvoices.rows[0]
              .count
          ),

        activeCrews:
          Number(
            crews.rows[0]
              .count
          )

      });

    } catch (err) {

      res.status(500).json({
        error:err.message
      });

    }

  }
);






app.get(
  '/api/alerts',
  async (req, res) => {

    try {

      const alerts = [];

      const stalledJobs =
        await pool.query(
          `
          SELECT
            job_id,
            status,
            dispatched_at
          FROM dispatch_jobs
          WHERE status IN (
            'dispatched',
            'en_route',
            'on_site',
            'in_progress'
          )
          `
        );

      stalledJobs.rows.forEach(
        job => {

          const ageHours =
            (
              Date.now() -
              new Date(
                job.dispatched_at
              ).getTime()
            ) / 3600000;

          if (
            ageHours > 2
          ) {

            alerts.push({
              type:'job.stalled',
              severity:'critical',
              title:'Job Stalled',
              message:
                job.job_id +
                ' (' +
                job.status +
                ')'
            });

          }

        }
      );

      const pendingInvoices =
        await pool.query(
          `
          SELECT
            invoice_id,
            amount,
            created_at
          FROM invoices
          WHERE status='pending'
          `
        );

      pendingInvoices.rows.forEach(
        invoice => {

          const ageDays =
            (
              Date.now() -
              new Date(
                invoice.created_at
              ).getTime()
            ) / 86400000;

          if (
            ageDays > 30
          ) {

            alerts.push({
              type:'invoice.overdue',
              severity:'critical',
              title:'Invoice Overdue',
              message:
                invoice.invoice_id
            });

          }

        }
      );

      const crews =
        await pool.query(
          `
          SELECT
            crew_id,
            updated_at
          FROM crew_locations
          `
        );

      crews.rows.forEach(
        crew => {

          const ageMinutes =
            (
              Date.now() -
              new Date(
                crew.updated_at
              ).getTime()
            ) / 60000;

          if (
            ageMinutes > 15
          ) {

            alerts.push({
              type:'crew.offline',
              severity:'warning',
              title:'Crew Offline',
              message:
                crew.crew_id
            });

          }

        }
      );

      const recentPayments =
        await pool.query(
          `
          SELECT
            payment_id,
            amount
          FROM payments
          ORDER BY received_at DESC
          LIMIT 5
          `
        );

      recentPayments.rows.forEach(
        payment => {

          alerts.push({
            type:'payment.received',
            severity:'success',
            title:'Payment Received',
            message:
              '$' +
              payment.amount
          });

        }
      );

      res.json(alerts);

    } catch (err) {

      res.status(500).json({
        error:err.message
      });

    }

  }
);





app.get(
  '/api/incidents',
  async (req, res) => {

    try {

      const alerts = [];

      const jobs =
        await pool.query(
          `
          SELECT
            job_id,
            status
          FROM dispatch_jobs
          WHERE status IN (
            'dispatched',
            'en_route',
            'on_site',
            'in_progress'
          )
          `
        );

      jobs.rows.forEach(
        job => {

          alerts.push({
            incident_id:
              'INC-' + job.job_id,
            type:'job.monitoring',
            status:'open',
            job_id:job.job_id,
            severity:'medium'
          });

        }
      );

      res.json(alerts);

    } catch (err) {

      res.status(500).json({
        error:err.message
      });

    }

  }
);




app.get(
  '/api/incidents',
  async(req,res)=>{

    const result=
      await pool.query(
        `
        SELECT *
        FROM incidents
        ORDER BY created_at DESC
        `
      );

    res.json(
      result.rows
    );

  }
);

app.put(
  '/api/incidents/:incidentId/acknowledge',
  async(req,res)=>{

    const result=
      await pool.query(
        `
        UPDATE incidents
        SET
          status='acknowledged',
          acknowledged_by=$1,
          acknowledged_at=NOW()
        WHERE incident_id=$2
        RETURNING *
        `,
        [
          req.body.user ||
          'manager',
          req.params.incidentId
        ]
      );

    await writeIncidentAudit(
      req.params.incidentId,
      'incident.acknowledged',
      req.body.user || 'manager'
    );

    await writeIncidentAudit(
      req.params.incidentId,
      'incident.resolved',
      req.body.user || 'manager'
    );

    res.json(
      result.rows[0]
    );

  }
);

app.put(
  '/api/incidents/:incidentId/resolve',
  async(req,res)=>{

    const result=
      await pool.query(
        `
        UPDATE incidents
        SET
          status='resolved',
          resolved_by=$1,
          resolved_at=NOW()
        WHERE incident_id=$2
        RETURNING *
        `,
        [
          req.body.user ||
          'manager',
          req.params.incidentId
        ]
      );

    res.json(
      result.rows[0]
    );

  }
);




app.get(
  '/api/system-health',
  async (req, res) => {

    const health = {
      crm:'online',
      postgres:'unknown',
      dispatch:'online',
      audit:'online',
      redis:'unknown',
      timestamp:new Date().toISOString()
    };

    try {

      await pool.query(
        'SELECT 1'
      );

      health.postgres =
        'online';

    } catch {

      health.postgres =
        'offline';

    }

    try {

      await pub.ping();

      health.redis =
        'online';

    } catch {

      health.redis =
        'offline';

    }

    res.json(
      health
    );

  }
);




app.put(
  '/api/incidents/:incidentId/assign',
  async(req,res)=>{

    try{

      const result=
        await pool.query(
          `
          UPDATE incidents
          SET
            assigned_to=$1,
            priority=$2,
            due_date=$3
          WHERE incident_id=$4
          RETURNING *
          `,
          [
            req.body.assigned_to,
            req.body.priority,
            req.body.due_date,
            req.params.incidentId
          ]
        );

      await pool.query(
        `
        INSERT INTO workflow_audit(
          workflow_id,
          event_type,
          payload
        )
        VALUES(
          $1,
          'incident.assigned',
          $2
        )
        `,
        [
          req.params.incidentId,
          JSON.stringify(req.body)
        ]
      );

      res.json(
        result.rows[0]
      );

    }catch(err){

      res.status(500).json({
        error:err.message
      });

    }

  }
);



app.post(
  '/api/work-orders',
  async(req,res)=>{

    try{

      const result=
        await pool.query(
          `
          INSERT INTO work_orders (
            work_order_id,
            client_id,
            property_id,
            job_id,
            title,
            description,
            priority,
            assigned_crew
          )
          VALUES (
            gen_random_uuid()::text,
            $1,$2,$3,$4,$5,$6,$7
          )
          RETURNING *
          `,
          [
            req.body.client_id,
            req.body.property_id,
            req.body.job_id,
            req.body.title,
            req.body.description,
            req.body.priority || 'normal',
            req.body.assigned_crew
          ]
        );

      res.json(result.rows[0]);

    }catch(err){

      res.status(500).json({
        error:err.message
      });

    }

  }
);

app.get(
  '/api/work-orders',
  async(req,res)=>{

    const result=
      await pool.query(
        `
        SELECT *
        FROM work_orders
        ORDER BY created_at DESC
        `
      );

    res.json(
      result.rows
    );

  }
);

app.get(
  '/api/work-orders/:workOrderId',
  async(req,res)=>{

    const result=
      await pool.query(
        `
        SELECT *
        FROM work_orders
        WHERE work_order_id=$1
        `,
        [
          req.params.workOrderId
        ]
      );

    res.json(
      result.rows[0]
    );

  }
);

app.put(
  '/api/work-orders/:workOrderId',
  async(req,res)=>{

    const result=
      await pool.query(
        `
        UPDATE work_orders
        SET
          title=$1,
          description=$2,
          priority=$3,
          assigned_crew=$4,
          status=$5
        WHERE work_order_id=$6
        RETURNING *
        `,
        [
          req.body.title,
          req.body.description,
          req.body.priority,
          req.body.assigned_crew,
          req.body.status,
          req.params.workOrderId
        ]
      );

    res.json(
      result.rows[0]
    );

  }
);

app.put(
  '/api/work-orders/:workOrderId/complete',
  async(req,res)=>{

    const signoffCheck =
      await pool.query(
        `
        SELECT *
        FROM customer_signoffs
        WHERE work_order_id=$1
        LIMIT 1
        `,
        [
          req.params.workOrderId
        ]
      );

    if(
      signoffCheck.rows.length === 0
    ){

      return res
        .status(400)
        .json({
          error:
            'Customer signoff required before completion'
        });

    }




    const result=
      await pool.query(
        `
        UPDATE work_orders
        SET
          status='completed',
          completed_at=NOW()
        WHERE work_order_id=$1
        RETURNING *
        `,
        [
          req.params.workOrderId
        ]
      );

    const workOrder =
      result.rows[0];

    let invoice =
      await pool.query(
        `
        SELECT *
        FROM invoices
        WHERE job_id = $1
        `,
        [
          workOrder.job_id
        ]
      );

    if(
      invoice.rows.length === 0
    ){

      invoice =
        await pool.query(
          `
          INSERT INTO invoices(
          invoice_id,
          job_id,
          client_id,
          amount,
          status
        )
        VALUES(
          gen_random_uuid()::text,
          $1,
          $2,
          250.00,
          'pending'
        )
        RETURNING *
        `,
        [
          workOrder.job_id,
          workOrder.client_id
        ]
      );

    }

    await pool.query(
      `
      INSERT INTO workflow_audit(
        workflow_id,
        event_type,
        payload
      )
      VALUES(
        $1,
        'work_order.completed',
        $2
      )
      `,
      [
        req.params.workOrderId,
        JSON.stringify({
          completed:true,
          invoiceId:
            invoice.rows[0]
              .invoice_id
        })
      ]
    );

    res.json({
      workOrder,
      invoice:
        invoice.rows[0]
    });

  }
);




app.put(
  '/api/work-orders/:workOrderId/start',
  async(req,res)=>{

    const result=
      await pool.query(
        `
        INSERT INTO work_order_execution(
          work_order_id,
          status,
          started_at
        )
        VALUES(
          $1,
          'in_progress',
          NOW()
        )
        ON CONFLICT DO NOTHING
        RETURNING *
        `,
        [req.params.workOrderId]
      );

    res.json(result.rows[0]||{
      status:'in_progress'
    });

  }
);

app.put(
  '/api/work-orders/:workOrderId/pause',
  async(req,res)=>{

    const result=
      await pool.query(
        `
        UPDATE work_order_execution
        SET
          status='paused',
          paused_at=NOW(),
          updated_at=NOW()
        WHERE work_order_id=$1
        RETURNING *
        `,
        [req.params.workOrderId]
      );

    res.json(result.rows[0]);

  }
);

app.put(
  '/api/work-orders/:workOrderId/execution',
  async(req,res)=>{

    const result=
      await pool.query(
        `
        UPDATE work_order_execution
        SET
          labor_hours=$1,
          materials_used=$2,
          crew_notes=$3,
          updated_at=NOW()
        WHERE work_order_id=$4
        RETURNING *
        `,
        [
          req.body.labor_hours,
          req.body.materials_used,
          req.body.crew_notes,
          req.params.workOrderId
        ]
      );

    res.json(result.rows[0]);

  }
);

app.get(
  '/api/work-orders/:workOrderId/execution',
  async(req,res)=>{

    const result=
      await pool.query(
        `
        SELECT *
        FROM work_order_execution
        WHERE work_order_id=$1
        `,
        [req.params.workOrderId]
      );

    res.json(result.rows[0]);

  }
);




app.post(
  '/api/work-orders/:workOrderId/media',
  async(req,res)=>{

    const result=
      await pool.query(
        `
        INSERT INTO work_order_media(
          work_order_id,
          media_type,
          file_url,
          uploaded_by
        )
        VALUES(
          $1,$2,$3,$4
        )
        RETURNING *
        `,
        [
          req.params.workOrderId,
          req.body.media_type,
          req.body.file_url,
          req.body.uploaded_by
        ]
      );

    res.json(result.rows[0]);

  }
);

app.get(
  '/api/work-orders/:workOrderId/media',
  async(req,res)=>{

    const result=
      await pool.query(
        `
        SELECT *
        FROM work_order_media
        WHERE work_order_id=$1
        ORDER BY created_at DESC
        `,
        [
          req.params.workOrderId
        ]
      );

    res.json(result.rows);

  }
);




const uploadDir =
  '/data/data/com.termux/files/home/bluedoor_platform_final/uploads/work-orders';

if(
  !fs.existsSync(
    uploadDir
  )
){
  fs.mkdirSync(
    uploadDir,
    {
      recursive:true
    }
  );
}

const storage =
  multer.diskStorage({

    destination:
      (
        req,
        file,
        cb
      ) => {

        cb(
          null,
          uploadDir
        );

      },

    filename:
      (
        req,
        file,
        cb
      ) => {

        cb(
          null,
          `${Date.now()}-${file.originalname}`
        );

      }

  });

const upload =
  multer({
    storage
  });

app.post(
  '/api/upload/work-order-media',
  upload.single(
    'file'
  ),
  async(
    req,
    res
  )=>{

    try{

      const fileUrl =
        `/uploads/work-orders/${req.file.filename}`;

      res.json({
        url:fileUrl
      });

    }catch(err){

      res.status(500).json({
        error:err.message
      });

    }

  }
);

app.post(
  '/api/work-orders/:workOrderId/media',
  async(
    req,
    res
  )=>{

    try{

      const result =
        await pool.query(
          `
          INSERT INTO work_order_media(
            work_order_id,
            media_type,
            file_url,
            uploaded_by
          )
          VALUES(
            $1,$2,$3,$4
          )
          RETURNING *
          `,
          [
            req.params.workOrderId,
            req.body.media_type,
            req.body.file_url,
            req.body.uploaded_by
          ]
        );

      res.json(
        result.rows[0]
      );

    }catch(err){

      res.status(500).json({
        error:err.message
      });

    }

  }
);

app.get(
  '/api/work-orders/:workOrderId/media',
  async(
    req,
    res
  )=>{

    try{

      const result =
        await pool.query(
          `
          SELECT *
          FROM work_order_media
          WHERE work_order_id=$1
          ORDER BY created_at DESC
          `,
          [
            req.params.workOrderId
          ]
        );

      res.json(
        result.rows
      );

    }catch(err){

      res.status(500).json({
        error:err.message
      });

    }

  }
);




app.post(
  '/api/work-orders/:workOrderId/signoff',
  async(req,res)=>{

    try{

      const result =
        await pool.query(
          `
          INSERT INTO customer_signoffs(
            work_order_id,
            customer_name,
            signature_url,
            signed_by
          )
          VALUES(
            $1,$2,$3,$4
          )
          RETURNING *
          `,
          [
            req.params.workOrderId,
            req.body.customer_name,
            req.body.signature_url,
            req.body.signed_by
          ]
        );

      await pool.query(
        `
        INSERT INTO workflow_audit(
          workflow_id,
          event_type,
          payload
        )
        VALUES(
          $1,
          'customer.signoff.completed',
          $2
        )
        `,
        [
          req.params.workOrderId,
          JSON.stringify({
            customer:
              req.body.customer_name,
            signature:
              req.body.signature_url
          })
        ]
      );

      res.json(
        result.rows[0]
      );

    }catch(err){

      res.status(500).json({
        error:err.message
      });

    }

  }
);

app.get(
  '/api/work-orders/:workOrderId/signoff',
  async(req,res)=>{

    try{

      const result =
        await pool.query(
          `
          SELECT *
          FROM customer_signoffs
          WHERE work_order_id=$1
          ORDER BY signed_at DESC
          LIMIT 1
          `,
          [
            req.params.workOrderId
          ]
        );

      res.json(
        result.rows[0] || null
      );

    }catch(err){

      res.status(500).json({
        error:err.message
      });

    }

  }
);




app.post(
  '/api/work-orders/:workOrderId/acceptance',
  async(req,res)=>{

    try{

      const result =
        await pool.query(
          `
          INSERT INTO customer_acceptance(
            work_order_id,
            accepted,
            accepted_by,
            accepted_at,
            notes
          )
          VALUES(
            $1,
            true,
            $2,
            NOW(),
            $3
          )
          ON CONFLICT(work_order_id)
          DO UPDATE SET
            accepted=true,
            accepted_by=EXCLUDED.accepted_by,
            accepted_at=NOW(),
            notes=EXCLUDED.notes
          RETURNING *
          `,
          [
            req.params.workOrderId,
            req.body.accepted_by,
            req.body.notes
          ]
        );

      res.json(result.rows[0]);

    }catch(err){

      res.status(500).json({
        error:err.message
      });

    }

  }
);

app.get(
  '/api/work-orders/:workOrderId/acceptance',
  async(req,res)=>{

    const result =
      await pool.query(
        `
        SELECT *
        FROM customer_acceptance
        WHERE work_order_id=$1
        `,
        [
          req.params.workOrderId
        ]
      );

    res.json(
      result.rows[0] || null
    );

  }
);




app.get(
  '/api/work-orders/:workOrderId/audit',
  async(req,res)=>{

    try{

      const result =
        await pool.query(
          `
          SELECT
            id,
            workflow_id,
            event_type,
            payload,
            created_at
          FROM workflow_audit
          WHERE workflow_id=$1
          ORDER BY created_at DESC
          `,
          [
            req.params.workOrderId
          ]
        );

      res.json(
        result.rows
      );

    }catch(err){

      console.error(err);

      res.status(500).json({
        error:err.message
      });

    }

  }
);




app.get(
  '/api/work-orders/:workOrderId/timeline',
  async(req,res)=>{

    try{

      const workOrderId =
        req.params.workOrderId;

      const timeline = [];

      const workOrderResult =
        await pool.query(
          `
          SELECT *
          FROM work_orders
          WHERE work_order_id=$1
          `,
          [workOrderId]
        );

      if(
        workOrderResult.rows.length
      ){

        timeline.push({
          type:'workorder.created',
          created_at:
            workOrderResult.rows[0]
              .created_at,
          payload:
            workOrderResult.rows[0]
        });

      }

      const auditResult =
        await pool.query(
          `
          SELECT
            event_type,
            payload,
            created_at
          FROM workflow_audit
          WHERE workflow_id=$1
          `,
          [workOrderId]
        );

      auditResult.rows.forEach(
        row=>timeline.push({
          type:row.event_type,
          created_at:
            row.created_at,
          payload:row.payload
        })
      );

      const mediaResult =
        await pool.query(
          `
          SELECT *
          FROM work_order_media
          WHERE work_order_id=$1
          `,
          [workOrderId]
        );

      mediaResult.rows.forEach(
        row=>timeline.push({
          type:'media.uploaded',
          created_at:
            row.created_at,
          payload:row
        })
      );

      const signoffResult =
        await pool.query(
          `
          SELECT *
          FROM customer_signoffs
          WHERE work_order_id=$1
          `,
          [workOrderId]
        );

      signoffResult.rows.forEach(
        row=>timeline.push({
          type:'customer.signoff',
          created_at:
            row.created_at,
          payload:row
        })
      );

      const acceptanceResult =
        await pool.query(
          `
          SELECT *
          FROM customer_acceptance
          WHERE work_order_id=$1
          `,
          [workOrderId]
        );

      acceptanceResult.rows.forEach(
        row=>timeline.push({
          type:'customer.acceptance',
          created_at:
            row.created_at,
          payload:row
        })
      );

      const invoiceResult =
        await pool.query(
          `
          SELECT *
          FROM invoices
          WHERE job_id=(
            SELECT job_id
            FROM work_orders
            WHERE work_order_id=$1
          )
          `,
          [workOrderId]
        );

      invoiceResult.rows.forEach(
        row=>timeline.push({
          type:'invoice.created',
          created_at:
            row.created_at,
          payload:row
        })
      );

      const paymentResult =
        await pool.query(
          `
          SELECT *
          FROM payments
          WHERE invoice_id IN (
            SELECT invoice_id
            FROM invoices
            WHERE job_id=(
              SELECT job_id
              FROM work_orders
              WHERE work_order_id=$1
            )
          )
          `,
          [workOrderId]
        );

      paymentResult.rows.forEach(
        row=>timeline.push({
          type:'payment.recorded',
          created_at:
            row.created_at,
          payload:row
        })
      );

      timeline.sort(
        (a,b)=>
          new Date(a.created_at) -
          new Date(b.created_at)
      );

      res.json(
        timeline
      );

    }catch(err){

      console.error(err);

      res.status(500).json({
        error:err.message
      });

    }

  }
);




app.get(
  '/api/work-orders/:workOrderId/dashboard',
  async(req,res)=>{

    try{

      const workOrderId =
        req.params.workOrderId;

      const workOrderResult =
        await pool.query(
          `
          SELECT *
          FROM work_orders
          WHERE work_order_id=$1
          `,
          [workOrderId]
        );

      if(
        !workOrderResult.rows.length
      ){

        return res
          .status(404)
          .json({
            error:
              'Work order not found'
          });

      }

      const workOrder =
        workOrderResult.rows[0];

      const executionResult =
        await pool.query(
          `
          SELECT *
          FROM work_order_execution
          WHERE work_order_id=$1
          LIMIT 1
          `,
          [workOrderId]
        );

      const mediaResult =
        await pool.query(
          `
          SELECT COUNT(*)::int count
          FROM work_order_media
          WHERE work_order_id=$1
          `,
          [workOrderId]
        );

      const signoffResult =
        await pool.query(
          `
          SELECT *
          FROM customer_signoffs
          WHERE work_order_id=$1
          ORDER BY created_at DESC
          LIMIT 1
          `,
          [workOrderId]
        );

      const acceptanceResult =
        await pool.query(
          `
          SELECT *
          FROM customer_acceptance
          WHERE work_order_id=$1
          ORDER BY created_at DESC
          LIMIT 1
          `,
          [workOrderId]
        );

      const auditResult =
        await pool.query(
          `
          SELECT COUNT(*)::int count
          FROM workflow_audit
          WHERE workflow_id=$1
          `,
          [workOrderId]
        );

      const invoiceResult =
        await pool.query(
          `
          SELECT *
          FROM invoices
          WHERE job_id=$1
          ORDER BY created_at DESC
          LIMIT 1
          `,
          [workOrder.job_id]
        );

      let payment = null;

      if(
        invoiceResult.rows.length
      ){

        const paymentResult =
          await pool.query(
            `
            SELECT *
            FROM payments
            WHERE invoice_id=$1
            ORDER BY received_at DESC
            LIMIT 1
            `,
            [
              invoiceResult.rows[0]
                .invoice_id
            ]
          );

        payment =
          paymentResult.rows[0] ||
          null;

      }

      const incidentResult =
        await pool.query(
          `
          SELECT *
          FROM incidents
          WHERE job_id=$1
          ORDER BY created_at DESC
          LIMIT 1
          `,
          [workOrder.job_id]
        );

      const createdAt =
        new Date(
          workOrder.created_at
        );

      const ageHours =
        (
          Date.now() -
          createdAt.getTime()
        ) /
        1000 /
        60 /
        60;

      const slaStatus =
        ageHours > 24 &&
        workOrder.status !==
          'completed'
          ? 'overdue'
          : 'within_sla';

      res.json({

        workOrder,

        execution:
          executionResult.rows[0]
          || null,

        mediaCount:
          mediaResult.rows[0]
            .count,

        timelineCount:
          auditResult.rows[0]
            .count,

        signoffStatus:
          signoffResult.rows.length
            ? 'completed'
            : 'pending',

        acceptanceStatus:
          acceptanceResult.rows.length
            ? 'accepted'
            : 'pending',

        invoiceStatus:
          invoiceResult.rows[0]
            ?.status ||
          'none',

        paymentStatus:
          payment?.status ||
          'unpaid',

        incidentStatus:
          incidentResult.rows[0]
            ?.status ||
          'none',

        slaStatus,

        metrics:{
          laborHours:
            executionResult.rows[0]
              ?.labor_hours || 0,

          materialsUsed:
            executionResult.rows[0]
              ?.materials_used || '',

          notes:
            executionResult.rows[0]
              ?.crew_notes || ''
        }

      });

    }catch(err){

      console.error(err);

      res.status(500).json({
        error:err.message
      });

    }

  }
);




app.get(
  '/api/operations/dashboard',
  async(req,res)=>{

    try{

      const [
        workOrders,
        incidents,
        invoices,
        payments
      ] = await Promise.all([

        pool.query(`
          SELECT *
          FROM work_orders
        `),

        pool.query(`
          SELECT *
          FROM incidents
        `),

        pool.query(`
          SELECT *
          FROM invoices
        `),

        pool.query(`
          SELECT *
          FROM payments
        `)

      ]);

      const dashboard = {

        workOrders:{
          total:
            workOrders.rows.length,

          open:
            workOrders.rows.filter(
              x=>x.status==='open'
            ).length,

          inProgress:
            workOrders.rows.filter(
              x=>
                x.status===
                'in_progress'
            ).length,

          completed:
            workOrders.rows.filter(
              x=>
                x.status===
                'completed'
            ).length
        },

        incidents:{
          total:
            incidents.rows.length,

          open:
            incidents.rows.filter(
              x=>x.status==='open'
            ).length,

          acknowledged:
            incidents.rows.filter(
              x=>
                x.status===
                'acknowledged'
            ).length,

          resolved:
            incidents.rows.filter(
              x=>
                x.status===
                'resolved'
            ).length
        },

        finance:{
          invoiceCount:
            invoices.rows.length,

          paymentCount:
            payments.rows.length,

          invoiceTotal:
            invoices.rows.reduce(
              (a,b)=>
                a +
                Number(
                  b.amount || 0
                ),
              0
            ),

          paymentTotal:
            payments.rows.reduce(
              (a,b)=>
                a +
                Number(
                  b.amount || 0
                ),
              0
            )
        },

        recentWorkOrders:
          workOrders.rows
            .sort(
              (a,b)=>
                new Date(
                  b.created_at
                ) -
                new Date(
                  a.created_at
                )
            )
            .slice(0,10),

        recentIncidents:
          incidents.rows
            .sort(
              (a,b)=>
                new Date(
                  b.created_at
                ) -
                new Date(
                  a.created_at
                )
            )
            .slice(0,10),

        generatedAt:
          new Date()
            .toISOString()

      };

      res.json(
        dashboard
      );

    }catch(err){

      console.error(err);

      res.status(500).json({
        error:err.message
      });

    }

  }
);




app.get(
  '/api/operations/executive-dashboard',
  async(req,res)=>{

    try{

      const [
        workOrders,
        incidents,
        invoices,
        payments
      ] = await Promise.all([

        pool.query(
          'SELECT * FROM work_orders'
        ),

        pool.query(
          'SELECT * FROM incidents'
        ),

        pool.query(
          'SELECT * FROM invoices'
        ),

        pool.query(
          'SELECT * FROM payments'
        )

      ]);

      const overdue =
        workOrders.rows.filter(
          row=>{

            if(
              row.status ===
              'completed'
            ){
              return false;
            }

            const age =
              (
                Date.now() -
                new Date(
                  row.created_at
                ).getTime()
              ) /
              1000 /
              60 /
              60;

            return age > 24;

          }
        );

      const openIncidents =
        incidents.rows.filter(
          x =>
            x.status !==
            'resolved'
        );

      const invoiceTotal =
        invoices.rows.reduce(
          (a,b)=>
            a +
            Number(
              b.amount || 0
            ),
          0
        );

      const paymentTotal =
        payments.rows.reduce(
          (a,b)=>
            a +
            Number(
              b.amount || 0
            ),
          0
        );

      const todayRevenue =
        payments.rows
          .filter(row=>{

            const d =
              new Date(
                row.received_at
              );

            const now =
              new Date();

            return (
              d.getFullYear() ===
              now.getFullYear()
              &&
              d.getMonth() ===
              now.getMonth()
              &&
              d.getDate() ===
              now.getDate()
            );

          })
          .reduce(
            (a,b)=>
              a +
              Number(
                b.amount || 0
              ),
            0
          );

      res.json({

        workOrders:{
          total:
            workOrders.rows.length,
          open:
            workOrders.rows.filter(
              x=>x.status==='open'
            ).length,
          inProgress:
            workOrders.rows.filter(
              x=>
                x.status===
                'in_progress'
            ).length,
          completed:
            workOrders.rows.filter(
              x=>
                x.status===
                'completed'
            ).length
        },

        incidents:{
          total:
            incidents.rows.length,
          open:
            openIncidents.length,
          resolved:
            incidents.rows.filter(
              x=>
                x.status===
                'resolved'
            ).length
        },

        revenue:{
          invoices:
            invoiceTotal,
          payments:
            paymentTotal,
          today:
            todayRevenue
        },

        sla:{
          overdue:
            overdue.length,
          healthy:
            workOrders.rows.length -
            overdue.length
        },

        activeAlerts:[
          ...overdue.map(
            x=>({
              type:'sla.violation',
              workOrderId:
                x.work_order_id,
              title:
                x.title
            })
          ),
          ...openIncidents.map(
            x=>({
              type:'incident',
              incidentId:
                x.incident_id,
              severity:
                x.severity
            })
          )
        ],

        overdueWorkOrders:
          overdue.slice(0,10),

        openIncidents:
          openIncidents.slice(0,10),

        generatedAt:
          new Date()
            .toISOString()

      });

    }catch(err){

      console.error(err);

      res.status(500).json({
        error:err.message
      });

    }

  }
);




app.get(
  '/api/incidents/:incidentId',
  async(req,res)=>{

    try{

      const result =
        await pool.query(
          `
          SELECT *
          FROM incidents
          WHERE incident_id=$1
          LIMIT 1
          `,
          [
            req.params.incidentId
          ]
        );

      if(!result.rows.length){

        return res
          .status(404)
          .json({
            error:'Incident not found'
          });

      }

      res.json(
        result.rows[0]
      );

    }catch(err){

      console.error(err);

      res.status(500).json({
        error:err.message
      });

    }

  }
);

app.get(
  '/api/incidents/:incidentId/timeline',
  async(req,res)=>{

    try{

      const incidentId =
        req.params.incidentId;

      const incident =
        await pool.query(
          `
          SELECT *
          FROM incidents
          WHERE incident_id=$1
          `,
          [incidentId]
        );

      if(!incident.rows.length){

        return res
          .status(404)
          .json({
            error:'Incident not found'
          });

      }

      const row =
        incident.rows[0];

      const timeline = [];

      timeline.push({
        type:'incident.created',
        created_at:
          row.created_at,
        payload:row
      });

      if(
        row.acknowledged_at
      ){

        timeline.push({
          type:'incident.acknowledged',
          created_at:
            row.acknowledged_at,
          payload:{
            acknowledged_by:
              row.acknowledged_by
          }
        });

      }

      if(
        row.resolved_at
      ){

        timeline.push({
          type:'incident.resolved',
          created_at:
            row.resolved_at,
          payload:{
            resolved_by:
              row.resolved_by,
            notes:
              row.resolution_notes
          }
        });

      }

      timeline.sort(
        (a,b)=>
          new Date(
            a.created_at
          ) -
          new Date(
            b.created_at
          )
      );

      res.json(
        timeline
      );

    }catch(err){

      console.error(err);

      res.status(500).json({
        error:err.message
      });

    }

  }
);

app.put(
  '/api/incidents/:incidentId/assign',
  async(req,res)=>{

    try{

      const {
        assigned_to
      } = req.body;

      const result =
        await pool.query(
          `
          UPDATE incidents
          SET assigned_to=$1
          WHERE incident_id=$2
          RETURNING *
          `,
          [
            assigned_to,
            req.params.incidentId
          ]
        );

      if(!result.rows.length){

        return res
          .status(404)
          .json({
            error:'Incident not found'
          });

      }

      res.json(
        result.rows[0]
      );

    }catch(err){

      console.error(err);

      res.status(500).json({
        error:err.message
      });

    }

  }
);

app.put(
  '/api/incidents/:incidentId/notes',
  async(req,res)=>{

    try{

      const {
        resolution_notes
      } = req.body;

      const result =
        await pool.query(
          `
          UPDATE incidents
          SET resolution_notes=$1
          WHERE incident_id=$2
          RETURNING *
          `,
          [
            resolution_notes,
            req.params.incidentId
          ]
        );

      if(!result.rows.length){

        return res
          .status(404)
          .json({
            error:'Incident not found'
          });

      }

      res.json(
        result.rows[0]
      );

    }catch(err){

      console.error(err);

      res.status(500).json({
        error:err.message
      });

    }

  }
);




app.get(
  '/api/incident-analytics',
  async(req,res)=>{

    try{

      const result =
        await pool.query(
          `
          SELECT *
          FROM incidents
          `
        );

      const incidents =
        result.rows;

      const total =
        incidents.length;

      const open =
        incidents.filter(
          x=>x.status==='open'
        ).length;

      const acknowledged =
        incidents.filter(
          x=>
            x.status==='acknowledged'
        ).length;

      const resolved =
        incidents.filter(
          x=>
            x.status==='resolved'
        ).length;

      const high =
        incidents.filter(
          x=>x.severity==='high'
        ).length;

      const medium =
        incidents.filter(
          x=>x.severity==='medium'
        ).length;

      const low =
        incidents.filter(
          x=>x.severity==='low'
        ).length;

      const resolvedRows =
        incidents.filter(
          x=>
            x.resolved_at &&
            x.created_at
        );

      let mttr = 0;

      if(
        resolvedRows.length
      ){

        mttr =
          resolvedRows.reduce(
            (sum,row)=>{

              const hours =
                (
                  new Date(
                    row.resolved_at
                  ) -
                  new Date(
                    row.created_at
                  )
                ) /
                1000 /
                60 /
                60;

              return sum + hours;

            },
            0
          ) /
          resolvedRows.length;

      }

      const ackRows =
        incidents.filter(
          x=>
            x.acknowledged_at &&
            x.created_at
        );

      let avgAck = 0;

      if(
        ackRows.length
      ){

        avgAck =
          ackRows.reduce(
            (sum,row)=>{

              const hours =
                (
                  new Date(
                    row.acknowledged_at
                  ) -
                  new Date(
                    row.created_at
                  )
                ) /
                1000 /
                60 /
                60;

              return sum + hours;

            },
            0
          ) /
          ackRows.length;

      }

      const resolutionRate =
        total
          ? (
              resolved /
              total
            ) * 100
          : 0;

      res.json({

        totals:{
          total,
          open,
          acknowledged,
          resolved
        },

        severity:{
          high,
          medium,
          low
        },

        sla:{
          mttrHours:
            Number(
              mttr.toFixed(2)
            ),
          avgAckHours:
            Number(
              avgAck.toFixed(2)
            )
        },

        resolutionRate:
          Number(
            resolutionRate.toFixed(2)
          ),

        generatedAt:
          new Date()
            .toISOString()

      });

    }catch(err){

      console.error(err);

      res.status(500).json({
        error:err.message
      });

    }

  }
);




app.get(
  '/api/incident-reports',
  async(req,res)=>{

    try{

      const period =
        req.query.period ||
        'all';

      let filter = '';

      if(period === 'weekly'){

        filter =
          "WHERE created_at >= NOW() - INTERVAL '7 days'";

      }else if(
        period === 'monthly'
      ){

        filter =
          "WHERE created_at >= NOW() - INTERVAL '30 days'";

      }

      const incidents =
        await pool.query(
          `
          SELECT *
          FROM incidents
          ${filter}
          ORDER BY created_at DESC
          `
        );

      const total =
        incidents.rows.length;

      const open =
        incidents.rows.filter(
          x=>x.status==='open'
        ).length;

      const acknowledged =
        incidents.rows.filter(
          x=>
            x.status===
            'acknowledged'
        ).length;

      const resolved =
        incidents.rows.filter(
          x=>
            x.status===
            'resolved'
        ).length;

      const high =
        incidents.rows.filter(
          x=>x.severity==='high'
        ).length;

      const medium =
        incidents.rows.filter(
          x=>x.severity==='medium'
        ).length;

      const low =
        incidents.rows.filter(
          x=>x.severity==='low'
        ).length;

      res.json({

        period,

        summary:{
          total,
          open,
          acknowledged,
          resolved
        },

        severity:{
          high,
          medium,
          low
        },

        incidents:
          incidents.rows,

        generatedAt:
          new Date()
            .toISOString()

      });

    }catch(err){

      console.error(err);

      res.status(500).json({
        error:err.message
      });

    }

  }
);


app.listen(port, () => {
  console.log(
    `[client-crm] running on ${port}`
  );
});
