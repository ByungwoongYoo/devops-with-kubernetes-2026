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
const maxTodoLength = requiredNumber('MAX_TODO_LENGTH');
const requestBodyLimit = requiredNumber('REQUEST_BODY_LIMIT_BYTES');
const pool = new Pool({
  host: required('DATABASE_HOST'),
  port: requiredNumber('DATABASE_PORT'),
  database: required('DATABASE_NAME'),
  user: required('DATABASE_USER'),
  password: required('DATABASE_PASSWORD'),
});

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(`${JSON.stringify(body)}\n`);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > requestBodyLimit) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function initializeDatabase() {
  let lastError;
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS todos (
          id SERIAL PRIMARY KEY,
          content TEXT NOT NULL
        )
      `);
      const result = await pool.query('SELECT COUNT(*)::int AS count FROM todos');
      if (result.rows[0].count === 0) {
        await pool.query(
          'INSERT INTO todos (content) VALUES ($1), ($2), ($3)',
          ['Learn Kubernetes', 'Build the todo application', 'Deploy it with Kubernetes']
        );
      }
      return;
    } catch (error) {
      lastError = error;
      console.log(`Database not ready (attempt ${attempt}/30): ${error.message}`);
      await delay(2000);
    }
  }
  throw lastError;
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/todos') {
      const result = await pool.query('SELECT id, content FROM todos ORDER BY id');
      sendJson(res, 200, result.rows);
      return;
    }

    if (req.method === 'POST' && req.url === '/todos') {
      let raw;
      try {
        raw = await readBody(req);
      } catch (_error) {
        sendJson(res, 413, { error: 'Request body too large' });
        return;
      }

      let data;
      try {
        data = JSON.parse(raw || '{}');
      } catch (_error) {
        sendJson(res, 400, { error: 'Invalid JSON body' });
        return;
      }

      const content = typeof data.content === 'string' ? data.content.trim() : '';
      if (!content || content.length > maxTodoLength) {
        sendJson(res, 400, { error: `Todo must contain 1-${maxTodoLength} characters` });
        return;
      }

      const result = await pool.query(
        'INSERT INTO todos (content) VALUES ($1) RETURNING id, content',
        [content]
      );
      sendJson(res, 201, result.rows[0]);
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    console.error(error);
    sendJson(res, 503, { error: 'Database unavailable' });
  }
});

async function main() {
  await initializeDatabase();
  server.listen(port, '0.0.0.0', () => {
    console.log(`Todo backend started in port ${port}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
