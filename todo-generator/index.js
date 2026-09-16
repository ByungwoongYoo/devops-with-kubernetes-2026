function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

function requiredNumber(name) {
  const value = Number(required(name));
  if (!Number.isFinite(value)) throw new Error(`Environment variable ${name} must be numeric`);
  return value;
}

const todoBackendUrl = required('TODO_BACKEND_URL');
const wikipediaRandomUrl = required('WIKIPEDIA_RANDOM_URL');
const maxTodoLength = requiredNumber('MAX_TODO_LENGTH');

async function getRandomArticleUrl() {
  const response = await fetch(wikipediaRandomUrl, { redirect: 'manual' });
  const location = response.headers.get('location');
  if (!location) {
    throw new Error(`Wikipedia random endpoint did not redirect (status ${response.status})`);
  }
  return new URL(location, wikipediaRandomUrl).toString();
}

async function chooseTodo() {
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    const articleUrl = await getRandomArticleUrl();
    const content = `Read ${articleUrl}`;
    if (content.length <= maxTodoLength) return content;
  }
  throw new Error(`Could not find a random article URL fitting ${maxTodoLength} characters`);
}

async function main() {
  const content = await chooseTodo();
  const response = await fetch(`${todoBackendUrl}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error(`Todo backend returned ${response.status}: ${(await response.text()).trim()}`);
  }

  console.log(`Created todo: ${content}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
