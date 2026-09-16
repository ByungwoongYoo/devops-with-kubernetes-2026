const fs = require('fs');
const http = require('http');
const path = require('path');

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
const imagePath = required('IMAGE_FILE');
const cacheTtlMs = requiredNumber('IMAGE_CACHE_TTL_MS');
const todoBackendUrl = required('TODO_BACKEND_URL').replace(/\/+$/, '');
const picsumUrl = required('PICSUM_URL');
const maxTodoLength = requiredNumber('MAX_TODO_LENGTH');
const requestBodyLimit = requiredNumber('REQUEST_BODY_LIMIT_BYTES');

fs.mkdirSync(path.dirname(imagePath), { recursive: true });

async function ensureImage() {
  let fresh = false;
  try {
    const stat = fs.statSync(imagePath);
    fresh = Date.now() - stat.mtimeMs < cacheTtlMs;
  } catch (_err) {
    fresh = false;
  }

  if (!fresh) {
    const response = await fetch(picsumUrl);
    if (!response.ok) throw new Error(`Image service returned ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(imagePath, bytes);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function fetchTodos() {
  const response = await fetch(`${todoBackendUrl}/todos`);
  if (!response.ok) throw new Error(`Todo backend returned ${response.status}`);
  return response.json();
}

async function createTodo(content) {
  const response = await fetch(`${todoBackendUrl}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message.trim() || `Todo backend returned ${response.status}`);
  }
}

async function completeTodo(id) {
  const response = await fetch(`${todoBackendUrl}/todos/${id}`, {
    method: 'PUT',
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message.trim() || `Todo backend returned ${response.status}`);
  }
  return response.json();
}

async function breakBackend() {
  const response = await fetch(`${todoBackendUrl}/break`, { method: 'POST' });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message.trim() || `Todo backend returned ${response.status}`);
  }
}

function page(todos) {
  const items = todos.map((todo) => {
    const content = escapeHtml(todo.content);
    if (todo.done) {
      return `<li style="margin-bottom:8px"><s>${content}</s> <strong>Done</strong></li>`;
    }
    return `<li style="margin-bottom:8px">${content} <button type="button" onclick="markDone(${todo.id})">Done</button></li>`;
  }).join('\n      ');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Todo app</title>
</head>
<body>
  <main style="max-width:760px;margin:40px auto;font-family:system-ui,sans-serif">
    <h1>Todo app</h1>
    <img src="/image" alt="Random cached image" style="display:block;width:100%;max-height:420px;object-fit:cover;margin-bottom:24px" />
    <form action="/todos" method="post" style="display:flex;gap:8px;margin-bottom:20px">
      <input id="todo" name="content" type="text" maxlength="${maxTodoLength}" required placeholder="Write a todo (max ${maxTodoLength} characters)" style="flex:1;padding:10px" />
      <button type="submit">Send</button>
    </form>
    <form action="/break" method="post" style="margin-bottom:20px">
      <button type="submit" style="background:#b42318;color:white;padding:8px 12px;border:0;border-radius:4px">Break the app</button>
    </form>
    <h2>Todos</h2>
    <ul>
      ${items}
    </ul>
  </main>
  <script>
    async function markDone(id) {
      const response = await fetch('/todos/' + id, { method: 'PUT' });
      if (!response.ok) {
        const message = await response.text();
        alert(message || 'Could not mark todo done');
        return;
      }
      window.location.reload();
    }
  </script>
</body>
</html>`;
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
  if (req.method === 'GET' && req.url === '/') {
    try {
      const todos = await fetchTodos();
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(page(todos));
    } catch (err) {
      res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Todo backend unavailable: ${err.message}\n`);
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/todos') {
    try {
      const params = new URLSearchParams(await readBody(req));
      const content = (params.get('content') || '').trim();
      if (!content || content.length > maxTodoLength) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Todo must contain 1-${maxTodoLength} characters\n`);
        return;
      }
      await createTodo(content);
      res.writeHead(303, { Location: '/' });
      res.end();
    } catch (err) {
      res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Could not create todo: ${err.message}\n`);
    }
    return;
  }

  const todoMatch = req.url.match(/^\/todos\/(\d+)$/);
  if (req.method === 'PUT' && todoMatch) {
    try {
      const id = Number(todoMatch[1]);
      const updated = await completeTodo(id);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(`${JSON.stringify(updated)}\n`);
    } catch (err) {
      res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Could not update todo: ${err.message}\n`);
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/break') {
    try {
      await breakBackend();
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="8;url=/"><title>Restarting</title></head>
<body style="font-family:system-ui,sans-serif;max-width:720px;margin:40px auto">
<h1>Application marked unhealthy</h1>
<p>The liveness probe should restart the backend container. This page will retry shortly.</p>
<p><a href="/">Retry now</a></p>
</body></html>`);
    } catch (err) {
      res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Could not break backend: ${err.message}\n`);
    }
    return;
  }

  if (req.method === 'GET' && req.url === '/image') {
    try {
      await ensureImage();
      res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'no-store' });
      fs.createReadStream(imagePath).pipe(res);
    } catch (err) {
      res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Image unavailable: ${err.message}\n`);
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found\n');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server started in port ${port}`);
});
