# DevOps with Kubernetes 2026 submissions

Exercises 1.1–1.9 for the University of Helsinki **DevOps with Kubernetes 2026** MOOC.

## Applications

- `log-output/`: logs a startup UUID with an ISO timestamp every 5 seconds and, from Exercise 1.7 onward, serves the current timestamp + UUID over HTTP.
- `todo-app/`: HTTP server whose port is controlled by the `PORT` environment variable; responds to `GET /`.
- `ping-pong/`: from Exercise 1.9 onward, responds to `GET /pingpong` with `pong N` and increments an in-memory counter.

## Exercise snapshots

Branches `1.1` through `3.8` preserve repository states for the completed exercises. See `SUBMISSION_LINKS.md`.

## Exercise 3.9 — DBaaS vs DIY PostgreSQL on GKE

This comparison focuses on the practical differences between running PostgreSQL ourselves in GKE with a StatefulSet + PersistentVolumeClaim and using a managed DBaaS such as Google Cloud SQL for PostgreSQL.

| Topic | DBaaS (Cloud SQL) | DIY PostgreSQL in GKE |
| --- | --- | --- |
| Initial setup work | Create the managed database instance, database/user credentials, networking/private IP or authorized access, and application connection settings. Google manages the database host and storage layer. | Create and maintain the StatefulSet, Service, Secret, storage claim, database initialization, readiness checks, upgrade strategy, and connectivity ourselves. |
| Initial cost | Usually higher than a very small self-hosted database because the managed instance has its own compute/storage charges and optional HA/backups. | Can be cheaper for a small course/dev workload because the database shares the existing GKE cluster; the main extra cost is persistent disk/storage. |
| Ongoing cost | Separate managed database compute + storage + backup/network-related charges. HA/read replicas increase cost further. | Uses GKE node capacity plus persistent disks. If the cluster already exists and has spare resources, marginal cost can be low, but larger DB workloads may force larger/more nodes. |
| Maintenance | Patching, database host management, storage infrastructure, many operational tasks, and managed backup features are handled by the provider. | We are responsible for PostgreSQL version upgrades, image changes, resource sizing, failed-pod recovery behavior, storage configuration, monitoring, security hardening, and testing restore procedures. |
| Availability | Managed HA/failover options are available and do not depend on us designing a multi-node PostgreSQL setup inside Kubernetes. | A single StatefulSet replica is simple but is not highly available. Real HA requires additional replication/failover tooling and significantly more operational work. |
| Backups | Managed automated backups and point-in-time recovery can be enabled. Restores are provider-supported workflows and are relatively easy to operate. | We must build the backup process ourselves (for example `pg_dump` from a CronJob), choose durable external storage, manage credentials/permissions, retention, monitoring, and regularly test restores. |
| Backup failure risk | The provider operates the backup infrastructure, although we still need to configure retention and verify restores. | A CronJob can silently fail, storage credentials can expire/change, or the backup can remain inside the same failure domain unless we explicitly upload it elsewhere. We own detection and recovery. |
| Scaling | Instance size/storage can be changed through the managed service; read replicas and other managed features may be available. | We must size pod requests/limits, disks, nodes, and PostgreSQL itself. Kubernetes pod scaling does not automatically make a single PostgreSQL database horizontally scalable. |
| Portability | More dependence on the cloud provider's managed service, networking, IAM and operational features. | PostgreSQL itself remains close to a standard containerized deployment and is easier to move between Kubernetes environments, although storage/network details still differ. |
| Operational control | Less low-level control because the provider manages the database host. | Maximum control over image/version/configuration and surrounding Kubernetes resources. |

For this course project, keeping PostgreSQL in GKE is useful because it demonstrates StatefulSets, PVCs, Secrets, Jobs/CronJobs and backup plumbing directly. For a production service where database reliability matters more than learning those Kubernetes internals, a managed PostgreSQL service would often reduce operational risk and maintenance effort, at the cost of a separate managed-service bill and stronger cloud-provider coupling.

The key trade-off is not simply "managed is expensive / self-hosted is cheap". DBaaS buys reduced operational burden, easier managed backups/restores and optional HA. DIY can minimize marginal cost and maximize control, but the team becomes responsible for database operations and recovery.

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
