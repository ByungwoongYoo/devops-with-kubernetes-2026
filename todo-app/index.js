const fs = require('fs');
const http = require('http');
const path = require('path');

const port = Number(process.env.PORT || 3000);
const imagePath = process.env.IMAGE_FILE || '/usr/src/app/files/image.jpg';
const cacheTtlMs = Number(process.env.IMAGE_CACHE_TTL_MS || 600000);

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

function page() {
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
    <div style="display:flex;gap:8px;margin-bottom:20px">
      <input id="todo" type="text" maxlength="140" placeholder="Write a todo (max 140 characters)" style="flex:1;padding:10px" />
      <button type="button">Send</button>
    </div>
    <h2>Todos</h2>
    <ul>
      <li>Learn Kubernetes</li>
      <li>Build the todo application</li>
      <li>Deploy it with Kubernetes</li>
    </ul>
  </main>
</body>
</html>`;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(page());
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
