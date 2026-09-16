const fs = require('fs');
const http = require('http');
const path = require('path');

const port = Number(process.env.PORT || 3000);
const imagePath = process.env.IMAGE_FILE || '/usr/src/app/files/image.jpg';
const cacheTtlMs = Number(process.env.IMAGE_CACHE_TTL_MS || 600000);
const todoBackendUrl = process.env.TODO_BACKEND_URL || 'http://todo-backend-svc:2345';

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
    const response = await fetch('https://picsum.photos/1200');
    if (!response.ok) throw new Error(`Picsum returned ${response.status}`);
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

function page(todos) {
  const items = todos.map((todo) => `<li>${escapeHtml(todo.content)}</li>`).join('\n      ');
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
      <input id="todo" name="content" type="text" maxlength="140" required placeholder="Write a todo (max 140 characters)" style="flex:1;padding:10px" />
      <button type="submit">Send</button>
    </form>
    <h2>Todos</h2>
    <ul>
      ${items}
    </ul>
  </main>
</body>
</html>`;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 10_000) {
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
      if (!content || content.length > 140) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Todo must contain 1-140 characters\n');
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
