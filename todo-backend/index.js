const http = require('http');

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
let nextId = 4;
const todos = [
  { id: 1, content: 'Learn Kubernetes' },
  { id: 2, content: 'Build the todo application' },
  { id: 3, content: 'Deploy it with Kubernetes' },
];

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

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/todos') {
    sendJson(res, 200, todos);
    return;
  }

  if (req.method === 'POST' && req.url === '/todos') {
    try {
      const raw = await readBody(req);
      const data = JSON.parse(raw || '{}');
      const content = typeof data.content === 'string' ? data.content.trim() : '';
      if (!content || content.length > maxTodoLength) {
        sendJson(res, 400, { error: `Todo must contain 1-${maxTodoLength} characters` });
        return;
      }

      const todo = { id: nextId++, content };
      todos.push(todo);
      sendJson(res, 201, todo);
    } catch (_err) {
      sendJson(res, 400, { error: 'Invalid JSON body' });
    }
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Todo backend started in port ${port}`);
});
