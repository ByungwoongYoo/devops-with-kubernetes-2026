const fs = require('fs');
const http = require('http');

const port = Number(process.env.PORT || 3000);
const logFile = process.env.LOG_FILE || '/usr/src/app/files/log.txt';
const pingPongUrl = process.env.PING_PONG_URL || 'http://ping-pong-svc:2346/pings';
const informationFile = process.env.INFORMATION_FILE || '/config/information.txt';
const message = process.env.MESSAGE || '';

function readStatus() {
  try {
    return fs.readFileSync(logFile, 'utf8').trim();
  } catch (_err) {
    return 'Waiting for log output';
  }
}

function readInformation() {
  try {
    return fs.readFileSync(informationFile, 'utf8').trim();
  } catch (_err) {
    return '';
  }
}

async function readPongCount() {
  const response = await fetch(pingPongUrl);
  if (!response.ok) {
    throw new Error(`Ping-pong service returned ${response.status}`);
  }
  const body = (await response.text()).trim();
  const count = Number.parseInt(body, 10);
  return Number.isFinite(count) ? count : 0;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/healthz') {
    try {
      await readPongCount();
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('ok\n');
    } catch (err) {
      res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Ping-pong unavailable: ${err.message}\n`);
    }
    return;
  }

  if (req.method === 'GET' && req.url === '/') {
    const status = readStatus();
    const information = readInformation();
    let count = 0;
    try {
      count = await readPongCount();
    } catch (err) {
      console.error(`Could not read ping-pong count: ${err.message}`);
    }

    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(
      `file content: ${information}\n` +
      `env variable: MESSAGE=${message}\n` +
      `${status}\n` +
      `Ping / Pongs: ${count}\n`
    );
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found\n');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Log reader started in port ${port}`);
});
