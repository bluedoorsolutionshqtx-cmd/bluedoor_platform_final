"use strict";

const http = require("http");
const { URL } = require("url");
const db = require("../../shared/db");

const PORT = Number(process.env.PORT || 4310);

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(body);
}

function sendNotFound(res, path) {
  return sendJson(res, 404, {
    error: "Not Found",
    path
  });
}

function sendMethodNotAllowed(res, method) {
  return sendJson(res, 405, {
    error: "Method Not Allowed",
    method
  });
}

function sendError(res, err) {
  return sendJson(res, 500, {
    error: "Internal Server Error",
    message: err.message
  });
}

function toLimit(value, fallback = 20, max = 200) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.floor(n), max);
}

async function health() {
  const result = await db.query("select now() as now, current_database() as database_name, current_user as database_user");
  return {
    ok: true,
    service: "admin-api",
    database: result.rows[0]
  };
}

async function getApprovals(limit) {
  const result = await db.query(
    `
    select
      decision_id,
      status,
      agent_name,
      action_id,
      reason,
      risk,
      input,
      context,
      requested_by,
      approved_by,
      denied_by,
      created_at,
      updated_at
    from approvals
    order by created_at desc
    limit $1
    `,
    [limit]
  );

  return result.rows;
}

async function getExecutions(limit) {
  const result = await db.query(
    `
    select
      execution_id,
      decision_id,
      agent_name,
      action_id,
      status,
      input,
      result,
      error,
      created_at
    from executions
    order by created_at desc
    limit $1
    `,
    [limit]
  );

  return result.rows;
}

async function getAuditEvents(limit) {
  const result = await db.query(
    `
    select
      event_type,
      agent_name,
      action_id,
      decision_id,
      execution_id,
      payload,
      created_at
    from audit_events
    order by created_at desc
    limit $1
    `,
    [limit]
  );

  return result.rows;
}

async function getMemory(limit) {
  const result = await db.query(
    `
    select
      memory_id,
      agent_name,
      action_id,
      decision_id,
      execution_id,
      outcome_summary,
      input,
      output,
      metadata,
      created_at
    from agent_memory
    order by created_at desc
    limit $1
    `,
    [limit]
  );

  return result.rows;
}

async function getDecisionTrace(decisionId) {
  const [approvalResult, executionResult, auditResult, memoryResult] = await Promise.all([
    db.query(
      `
      select
        decision_id,
        status,
        agent_name,
        action_id,
        reason,
        risk,
        input,
        context,
        requested_by,
        approved_by,
        denied_by,
        created_at,
        updated_at
      from approvals
      where decision_id = $1
      limit 1
      `,
      [decisionId]
    ),
    db.query(
      `
      select
        execution_id,
        decision_id,
        agent_name,
        action_id,
        status,
        input,
        result,
        error,
        created_at
      from executions
      where decision_id = $1
      order by created_at desc
      `,
      [decisionId]
    ),
    db.query(
      `
      select
        event_type,
        agent_name,
        action_id,
        decision_id,
        execution_id,
        payload,
        created_at
      from audit_events
      where decision_id = $1
      order by created_at asc
      `,
      [decisionId]
    ),
    db.query(
      `
      select
        memory_id,
        agent_name,
        action_id,
        decision_id,
        execution_id,
        outcome_summary,
        input,
        output,
        metadata,
        created_at
      from agent_memory
      where decision_id = $1
      order by created_at desc
      `,
      [decisionId]
    )
  ]);

  return {
    decisionId,
    approval: approvalResult.rows[0] || null,
    executions: executionResult.rows,
    auditEvents: auditResult.rows,
    memory: memoryResult.rows
  };
}

async function router(req, res) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end();
    return;
  }

  if (req.method !== "GET") {
    return sendMethodNotAllowed(res, req.method);
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const limit = toLimit(url.searchParams.get("limit"), 20, 200);

  if (pathname === "/health") {
    return sendJson(res, 200, await health());
  }

  if (pathname === "/approvals") {
    return sendJson(res, 200, {
      items: await getApprovals(limit)
    });
  }

  if (pathname === "/executions") {
    return sendJson(res, 200, {
      items: await getExecutions(limit)
    });
  }

  if (pathname === "/audit-events") {
    return sendJson(res, 200, {
      items: await getAuditEvents(limit)
    });
  }

  if (pathname === "/memory") {
    return sendJson(res, 200, {
      items: await getMemory(limit)
    });
  }

  if (pathname.startsWith("/decision/")) {
    const decisionId = decodeURIComponent(pathname.replace("/decision/", "").trim());

    if (!decisionId) {
      return sendJson(res, 400, {
        error: "decisionId is required"
      });
    }

    return sendJson(res, 200, await getDecisionTrace(decisionId));
  }

  if (pathname === "/") {
    return sendJson(res, 200, {
      service: "admin-api",
      routes: [
        "/health",
        "/approvals?limit=20",
        "/executions?limit=20",
        "/audit-events?limit=20",
        "/memory?limit=20",
        "/decision/:decisionId"
      ]
    });
  }

  return sendNotFound(res, pathname);
}

const server = http.createServer(async (req, res) => {
  try {
    await router(req, res);
  } catch (err) {
    console.error("ADMIN API error:", err);
    sendError(res, err);
  }
});

server.listen(PORT, () => {
  console.log(`Admin API listening on port ${PORT}`);
});
