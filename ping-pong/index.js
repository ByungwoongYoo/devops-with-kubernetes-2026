const fs = require('fs');
const http = require('http');
const path = require('path');

const port = Number(process.env.PORT || 3000);
const counterFile = process.env.COUNTER_FILE || '/usr/src/app/files/ping-pong.txt';

fs.mkdirSync(path.dirname(counterFile), { recursive: true });
if (!fs.existsSync(counterFile)) {
  fs.writeFileSync(counterFile, '0\n', 'utf8');
}

function readCount() {
  const value = Number.parseInt(fs.readFileSync(counterFile, 'utf8').trim(), 10);
  return Number.isFinite(value) ? value : 0;
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/pingpong') {
    const count = readCount();
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`pong ${count}\n`);
    fs.writeFileSync(counterFile, `${count + 1}\n`, 'utf8');
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found\n');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Ping-pong server started in port ${port}`);
});
