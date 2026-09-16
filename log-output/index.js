const { randomUUID } = require('crypto');

const randomString = randomUUID();

function printLog() {
  console.log(`${new Date().toISOString()}: ${randomString}`);
}

printLog();
setInterval(printLog, 5000);
