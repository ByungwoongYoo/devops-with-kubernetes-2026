const { connect, JSONCodec } = require('nats');

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const natsUrl = required('NATS_URL');
const natsSubject = required('NATS_SUBJECT');
const natsQueue = required('NATS_QUEUE');
const broadcastUrl = required('BROADCAST_URL');
const broadcastUser = required('BROADCAST_USER');
const codec = JSONCodec();

async function connectWithRetry() {
  let lastError;
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      const nc = await connect({ servers: natsUrl, name: `broadcaster-${process.pid}` });
      console.log(`Connected to NATS at ${natsUrl}`);
      return nc;
    } catch (error) {
      lastError = error;
      console.log(`NATS not ready (attempt ${attempt}/30): ${error.message}`);
      await delay(2000);
    }
  }
  throw lastError;
}

async function forwardEvent(event) {
  const payload = {
    user: broadcastUser,
    message: event.message || 'A todo changed',
  };

  const response = await fetch(broadcastUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`External service returned ${response.status}`);
  }
}

async function main() {
  const nc = await connectWithRetry();
  const subscription = nc.subscribe(natsSubject, { queue: natsQueue });

  console.log(
    `Broadcaster listening on subject ${natsSubject} in queue group ${natsQueue}`
  );

  for await (const message of subscription) {
    let event;
    try {
      event = codec.decode(message.data);
    } catch (error) {
      console.error(`Could not decode NATS message: ${error.message}`);
      continue;
    }

    try {
      await forwardEvent(event);
      console.log(
        JSON.stringify({
          event: 'broadcast_sent',
          todoEventType: event.type,
          todoId: event.todo?.id,
        })
      );
    } catch (error) {
      // Deliberately do not retry here. Core NATS queue subscriptions deliver
      // each event to one broadcaster replica; the course allows an occasional
      // missing message but explicitly forbids duplicates.
      console.error(
        JSON.stringify({
          event: 'broadcast_failed',
          todoEventType: event.type,
          todoId: event.todo?.id,
          error: error.message,
        })
      );
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
