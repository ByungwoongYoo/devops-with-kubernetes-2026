# Local persistent volumes for the k3d exercises

These PersistentVolume definitions are kept outside the application folders because PVs are cluster-level resources.

For the local k3d cluster used in the course, the backing directories are expected on `k3d-k3s-default-agent-0`:

```bash
docker exec k3d-k3s-default-agent-0 mkdir -p /tmp/kube
docker exec k3d-k3s-default-agent-0 mkdir -p /tmp/todo-kube
```

Exercise 1.11 uses `/tmp/kube`. Exercise 1.12 uses `/tmp/todo-kube`.
