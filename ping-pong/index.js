const http = require('http');

const port = Number(process.env.PORT || 3000);
let counter = 0;

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/pingpong') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`pong ${counter}\n`);
    counter += 1;
    return;
  }

  if (req.method === 'GET' && req.url === '/pings') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`${counter}\n`);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found\n');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Ping-pong server started in port ${port}`);
});
