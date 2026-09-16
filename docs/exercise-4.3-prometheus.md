# Exercise 4.3 — Prometheus

The query counts pods in the `prometheus` namespace whose owner kind is a StatefulSet:

```promql
count(kube_pod_info{namespace="prometheus", created_by_kind="StatefulSet"})
```

With the course Prometheus setup this should return `3`.

The query uses `kube_pod_info` because it exposes the pod namespace together with the owning resource kind.
