const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const filePath = process.env.LOG_FILE || '/usr/src/app/files/log.txt';
const randomString = randomUUID();

fs.mkdirSync(path.dirname(filePath), { recursive: true });

function writeLine() {
  const line = `${new Date().toISOString()}: ${randomString}`;
  fs.writeFileSync(filePath, `${line}\n`, 'utf8');
  console.log(line);
}

writeLine();
setInterval(writeLine, 5000);
