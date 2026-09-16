const http = require('http');
const { Pool } = require('pg');

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

function requiredNumber(name) {
  const value = Number(required(name));
  if (!Number.isFinite(value)) throw new Error(`Environment variable ${name} must be numeric`);
  return value;
}

const port = requiredNumber('PORT');
const pool = new Pool({
  host: required('DATABASE_HOST'),
  port: requiredNumber('DATABASE_PORT'),
  database: required('DATABASE_NAME'),
  user: required('DATABASE_USER'),
  password: required('DATABASE_PASSWORD'),
});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function initializeDatabase() {
  let lastError;
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ping_pong_counter (
          id SMALLINT PRIMARY KEY,
          value INTEGER NOT NULL
        )
      `);
      await pool.query(
        'INSERT INTO ping_pong_counter (id, value) VALUES (1, 0) ON CONFLICT (id) DO NOTHING'
      );
      return;
    } catch (error) {
      lastError = error;
      console.log(`Database not ready (attempt ${attempt}/30): ${error.message}`);
      await delay(2000);
    }
  }
  throw lastError;
}

async function checkDatabase() {
  await pool.query('SELECT 1');
}

async function getCount() {
  const result = await pool.query('SELECT value FROM ping_pong_counter WHERE id = 1');
  return Number(result.rows[0].value);
}

async function incrementAndGetPreviousCount() {
  const result = await pool.query(
    'UPDATE ping_pong_counter SET value = value + 1 WHERE id = 1 RETURNING value - 1 AS previous'
  );
  return Number(result.rows[0].previous);
}

async function respondWithPong(res) {
  const previous = await incrementAndGetPreviousCount();
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(`pong ${previous}\n`);
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/healthz') {
      await checkDatabase();
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('ok\n');
      return;
    }

    if (req.method === 'GET' && req.url === '/') {
      await respondWithPong(res);
      return;
    }

    // Kept for backwards compatibility; Gateway API rewrites /pingpong to /.
    if (req.method === 'GET' && req.url === '/pingpong') {
      await respondWithPong(res);
      return;
    }

    if (req.method === 'GET' && req.url === '/pings') {
      const count = await getCount();
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`${count}\n`);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found\n');
  } catch (error) {
    console.error(error);
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Database unavailable\n');
  }
});

async function main() {
  await initializeDatabase();
  server.listen(port, '0.0.0.0', () => {
    console.log(`Ping-pong server started in port ${port}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
