"use strict";

const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not set");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
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
