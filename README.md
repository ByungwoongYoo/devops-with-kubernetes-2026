# DevOps with Kubernetes 2026 submissions

Exercises 1.1–1.4 for the University of Helsinki **DevOps with Kubernetes 2026** MOOC.

## Apps

- `log-output/`: generates one random UUID at startup and logs the same value with an ISO timestamp every 5 seconds.
- `todo-app/`: HTTP server whose port is controlled by the `PORT` environment variable.

## Local k3d verification

Create the cluster:

```bash
k3d cluster create -a 2
kubectl cluster-info
```

### Log output

```bash
docker build -t dwk-log-output:1.3 ./log-output
k3d image import dwk-log-output:1.3
kubectl apply -f log-output/manifests/deployment.yaml
kubectl get pods
kubectl logs -f deployment/log-output-dep
```

Expected log shape:

```text
2026-09-16T00:00:00.000Z: <same-uuid-every-5-seconds>
```

### Todo app

```bash
docker build -t dwk-todo-app:1.4 ./todo-app
k3d image import dwk-todo-app:1.4
kubectl apply -f todo-app/manifests/deployment.yaml
kubectl get pods
kubectl logs deployment/todo-app-dep
```

Expected startup log:

```text
Server started in port 3000
```

## Exercise tags

- `1.1` — Getting started
- `1.2` — The project, step 1
- `1.3` — Declarative approach
- `1.4` — The project, step 2

After pushing the repository and tags to GitHub, create a GitHub Release for each tag and submit each release URL to MOOC.fi.
