# Exercise 4.6 — Todo broadcaster with NATS

The todo backend publishes an event to Core NATS after a todo is created or marked done. The event is published on the `todo.events` subject.

A separate `todo-broadcaster` service subscribes to the same subject using the queue group `todo-broadcasters`. The broadcaster Deployment intentionally runs with **6 replicas**. Because all replicas use the same NATS queue group, one published event is delivered to only one broadcaster replica instead of all six, preventing duplicate notifications from normal fan-out.

The broadcaster forwards the event once to a configurable external HTTP endpoint. The URL is provided through the `BROADCAST_URL` environment variable. The payload is:

```json
{
  "user": "bot",
  "message": "Todo created: example"
}
```

For the repository deployment the generic endpoint is `https://httpbin.org/post`, so no Discord, Telegram, or Slack credentials are stored in GitHub. It can be replaced with any compatible webhook URL through the ConfigMap.

The broadcaster deliberately does **not** retry a failed outbound request. The exercise states that an occasional missing notification is acceptable but a duplicate is not, so at-most-once Core NATS queue delivery plus a single outbound attempt matches that requirement.

Relevant files:

- `todo-backend/index.js` — publishes create/update events
- `broadcaster/index.js` — queue subscriber and external forwarding
- `broadcaster/manifests/deployment.yaml` — six replicas
- `nats/manifests/` — in-cluster NATS server and Service
- `todo-app/manifests/configmap.yaml` — NATS and webhook environment configuration
