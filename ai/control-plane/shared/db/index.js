"use strict";

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.BLUEDOOR_PG_HOST || "127.0.0.1",
  port: Number(process.env.BLUEDOOR_PG_PORT || 5432),
  database: process.env.BLUEDOOR_PG_DATABASE || "bluedoor_ai",
  user: process.env.BLUEDOOR_PG_USER || "postgres",
  password: process.env.BLUEDOOR_PG_PASSWORD || "postgres"
});

async function query(text, params = []) {
  return pool.query(text, params);
}

async function close() {
  await pool.end();
}

module.exports = {
  pool,
  query,
  close
};
