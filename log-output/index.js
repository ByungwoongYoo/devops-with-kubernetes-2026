const http = require('http');
const { randomUUID } = require('crypto');

const port = Number(process.env.PORT || 3000);
const randomString = randomUUID();

function statusLine() {
  return `${new Date().toISOString()}: ${randomString}`;
}

function printLog() {
  console.log(statusLine());
}

printLog();
setInterval(printLog, 5000);

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`${statusLine()}\n`);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found\n');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`HTTP server started in port ${port}`);
});
