# Exercise 2.10 — Project step 13

The todo backend logs every POST /todos request to stdout as structured JSON so the entries are collected by the Kubernetes logging stack and are searchable in Grafana/Loki.

Events:

- `todo_received` — every parsed todo submission, including content and length.
- `todo_created` — a todo that passed validation and was persisted.
- `todo_rejected` — invalid JSON, oversized request bodies, empty todos, or todos longer than the configured maximum.

The backend enforces the configured `MAX_TODO_LENGTH`; the project ConfigMap keeps this value at 140 characters.

Example Loki queries after deployment:

```logql
{namespace="project"} |= "todo_received"
```

```logql
{namespace="project"} |= "todo_rejected"
```

Runtime verification was intentionally not performed for this exercise.
