const fs = require('fs');
const http = require('http');

const port = Number(process.env.PORT || 3000);
const filePath = process.env.LOG_FILE || '/usr/src/app/files/log.txt';

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    if (!fs.existsSync(filePath)) {
      res.end('Waiting for log output\n');
      return;
    }
    res.end(fs.readFileSync(filePath, 'utf8'));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found\n');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Log reader started in port ${port}`);
});
