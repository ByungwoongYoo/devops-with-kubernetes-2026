const http = require('http');
const { Pool } = require('pg');
const { connect, JSONCodec } = require('nats');

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
const natsUrl = required('NATS_URL');
const natsSubject = required('NATS_SUBJECT');
const natsCodec = JSONCodec();

const pool = new Pool({
  host: required('DATABASE_HOST'),
  port: requiredNumber('DATABASE_PORT'),
  database: required('DATABASE_NAME'),
  user: required('DATABASE_USER'),
  password: required('DATABASE_PASSWORD'),
});

let isHealthy = true;
let natsConnection = null;

function logTodo(event, details = {}) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    service: 'todo-backend',
    event,
    ...details,
  }));
}

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
          content TEXT NOT NULL,
          done BOOLEAN NOT NULL DEFAULT FALSE
        )
      `);
      await pool.query(
        'ALTER TABLE todos ADD COLUMN IF NOT EXISTS done BOOLEAN NOT NULL DEFAULT FALSE'
      );
      const result = await pool.query('SELECT COUNT(*)::int AS count FROM todos');
      if (result.rows[0].count === 0) {
        await pool.query(
          'INSERT INTO todos (content, done) VALUES ($1, FALSE), ($2, FALSE), ($3, FALSE)',
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

async function initializeNats() {
  let lastError;
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      natsConnection = await connect({
        servers: natsUrl,
        name: 'todo-backend',
      });
      console.log(`Connected to NATS at ${natsUrl}`);
      return;
    } catch (error) {
      lastError = error;
      console.log(`NATS not ready (attempt ${attempt}/30): ${error.message}`);
      await delay(2000);
    }
  }
  throw lastError;
}

async function publishTodoEvent(type, todo) {
  if (!natsConnection) {
    logTodo('todo_event_skipped', { reason: 'nats_not_connected', type, id: todo.id });
    return;
  }

  const message = type === 'created'
    ? `Todo created: ${todo.content}`
    : `Todo completed: ${todo.content}`;

  const event = {
    type,
    todo,
    message,
    timestamp: new Date().toISOString(),
  };

  try {
    natsConnection.publish(natsSubject, natsCodec.encode(event));
    await natsConnection.flush();
    logTodo('todo_event_published', { type, id: todo.id });
  } catch (error) {
    // Do not retry the publish here: the exercise prefers an occasional
    // missing notification over the possibility of a duplicate.
    logTodo('todo_event_publish_failed', {
      type,
      id: todo.id,
      error: error.message,
    });
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/healthz') {
      if (!isHealthy) {
        sendJson(res, 500, { status: 'unhealthy' });
        return;
      }
      sendJson(res, 200, { status: 'ok' });
      return;
    }

    if (req.method === 'GET' && req.url === '/readyz') {
      if (!isHealthy || !natsConnection) {
        sendJson(res, 500, { status: 'not-ready' });
        return;
      }
      await pool.query('SELECT 1');
      sendJson(res, 200, { status: 'ready' });
      return;
    }

    if (req.method === 'POST' && req.url === '/break') {
      isHealthy = false;
      logTodo('application_broken_for_probe_test');
      sendJson(res, 200, { status: 'breaking' });
      return;
    }

    if (req.method === 'GET' && req.url === '/todos') {
      const result = await pool.query('SELECT id, content, done FROM todos ORDER BY id');
      sendJson(res, 200, result.rows);
      return;
    }

    if (req.method === 'POST' && req.url === '/todos') {
      let raw;
      try {
        raw = await readBody(req);
      } catch (_error) {
        logTodo('todo_rejected', { reason: 'request_body_too_large' });
        sendJson(res, 413, { error: 'Request body too large' });
        return;
      }

      let data;
      try {
        data = JSON.parse(raw || '{}');
      } catch (_error) {
        logTodo('todo_rejected', { reason: 'invalid_json' });
        sendJson(res, 400, { error: 'Invalid JSON body' });
        return;
      }

      const content = typeof data.content === 'string' ? data.content.trim() : '';
      logTodo('todo_received', {
        content,
        length: content.length,
      });

      if (!content) {
        logTodo('todo_rejected', {
          reason: 'empty_todo',
          content,
          length: content.length,
        });
        sendJson(res, 400, { error: `Todo must contain 1-${maxTodoLength} characters` });
        return;
      }

      if (content.length > maxTodoLength) {
        logTodo('todo_rejected', {
          reason: 'too_long',
          content,
          length: content.length,
          maxLength: maxTodoLength,
        });
        sendJson(res, 400, { error: `Todo must contain 1-${maxTodoLength} characters` });
        return;
      }

      const result = await pool.query(
        'INSERT INTO todos (content, done) VALUES ($1, FALSE) RETURNING id, content, done',
        [content]
      );

      const todo = result.rows[0];
      logTodo('todo_created', {
        id: todo.id,
        content: todo.content,
        length: todo.content.length,
      });
      await publishTodoEvent('created', todo);
      sendJson(res, 201, todo);
      return;
    }

    const todoMatch = req.url.match(/^\/todos\/(\d+)$/);
    if (req.method === 'PUT' && todoMatch) {
      const id = Number(todoMatch[1]);
      const result = await pool.query(
        'UPDATE todos SET done = TRUE WHERE id = $1 RETURNING id, content, done',
        [id]
      );

      if (result.rowCount === 0) {
        sendJson(res, 404, { error: 'Todo not found' });
        return;
      }

      const todo = result.rows[0];
      logTodo('todo_completed', {
        id: todo.id,
        content: todo.content,
      });
      await publishTodoEvent('completed', todo);
      sendJson(res, 200, todo);
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
  await initializeNats();
  server.listen(port, '0.0.0.0', () => {
    console.log(`Todo backend started in port ${port}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
