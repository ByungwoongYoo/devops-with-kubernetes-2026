const fs = require('fs');
const http = require('http');

const port = Number(process.env.PORT || 3000);
const logFile = process.env.LOG_FILE || '/usr/src/app/files/log.txt';
const counterFile = process.env.COUNTER_FILE || '/usr/src/app/files/ping-pong.txt';

function readText(file, fallback) {
  try {
    return fs.readFileSync(file, 'utf8').trim();
  } catch (_err) {
    return fallback;
  }
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    const status = readText(logFile, 'Waiting for log output');
    const count = readText(counterFile, '0');
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`${status}\nPing / Pongs: ${count}\n`);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found\n');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Log reader started in port ${port}`);
});
