# DevOps with Kubernetes 2026 submissions

Exercises 1.1–1.9 for the University of Helsinki **DevOps with Kubernetes 2026** MOOC.

## Applications

- `log-output/`: logs a startup UUID with an ISO timestamp every 5 seconds and, from Exercise 1.7 onward, serves the current timestamp + UUID over HTTP.
- `todo-app/`: HTTP server whose port is controlled by the `PORT` environment variable; responds to `GET /`.
- `ping-pong/`: from Exercise 1.9 onward, responds to `GET /pingpong` with `pong N` and increments an in-memory counter.

## Exercise snapshots

Branches `1.1` through `1.9` preserve the repository state for each exercise. See `SUBMISSION_LINKS.md`.

## Local verification for Exercises 1.5–1.9

The networking exercises use a k3d cluster with host ports 8081 and 8082 exposed. Recreate the cluster before testing them:

```powershell
k3d cluster delete
k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2
kubectl get nodes
```

### Exercise 1.5 — Todo GET /

```powershell
docker build -t dwk-todo-app:1.5 ./todo-app
k3d image import dwk-todo-app:1.5 -c k3s-default
kubectl apply -f todo-app/manifests/deployment.yaml
kubectl rollout status deployment/todo-app-dep --timeout=90s
kubectl port-forward deployment/todo-app-dep 3003:3000
```

With port-forward running, open `http://localhost:3003/` in a browser. It should show the Todo app page.

### Exercise 1.6 — NodePort

Checkout branch `1.6` or use its service definition, then:

```powershell
kubectl apply -f todo-app/manifests/service.yaml
```

Open `http://localhost:8082/` and confirm the Todo app responds.

### Exercise 1.7 — Log output via Ingress

```powershell
git checkout 1.7
docker build -t dwk-log-output:1.7 ./log-output
k3d image import dwk-log-output:1.7 -c k3s-default
kubectl apply -f log-output/manifests
kubectl rollout status deployment/log-output-dep --timeout=90s
```

Open `http://localhost:8081/`. The response should contain the current ISO timestamp and the same UUID stored by the running process.

### Exercise 1.8 — Todo via Ingress

```powershell
git checkout 1.8
docker build -t dwk-todo-app:1.5 ./todo-app
k3d image import dwk-todo-app:1.5 -c k3s-default
kubectl delete ingress --all --ignore-not-found
kubectl apply -f todo-app/manifests
```

Open `http://localhost:8081/` and confirm the Todo app responds through Ingress.

### Exercise 1.9 — Shared Ingress and ping-pong

```powershell
git checkout 1.9
docker build -t dwk-log-output:1.7 ./log-output
docker build -t dwk-ping-pong:1.9 ./ping-pong
k3d image import dwk-log-output:1.7 dwk-ping-pong:1.9 -c k3s-default
kubectl delete ingress --all --ignore-not-found
kubectl apply -f log-output/manifests
kubectl apply -f ping-pong/manifests
kubectl get pods,svc,ing
```

Open `http://localhost:8081/` for Log output and request `http://localhost:8081/pingpong` repeatedly. The latter should return `pong 0`, then `pong 1`, `pong 2`, and so on while the same pod stays alive.

Return to the latest repository state with:

```powershell
git checkout main
git pull
```
