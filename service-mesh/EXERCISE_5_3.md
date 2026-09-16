# Exercise 5.3 — Log app, the Service Mesh Edition

The manifest `log-greeter.yaml` deploys the Log output app and a two-version greeter into the Istio ambient mesh.

Traffic path:

```text
log-output -> greeter-svc -> 75% greeter-svc-1 / 25% greeter-svc-2
```

The `HTTPRoute` is attached directly to `greeter-svc` and is processed by the namespace waypoint.

## Build the Log output images

```bash
docker build -f log-output/Dockerfile.writer -t dwk-log-output-writer:5.3 ./log-output
docker build -f log-output/Dockerfile.reader -t dwk-log-output-reader:5.3 ./log-output
k3d image import dwk-log-output-writer:5.3 dwk-log-output-reader:5.3 -c k3s-default
```

## Deploy

Istio ambient mode and the Gateway API CRDs must already be installed as in Exercise 5.2.

```bash
kubectl apply -f service-mesh/log-greeter.yaml
kubectl wait --for=condition=programmed gateway/waypoint -n exercises --timeout=120s
kubectl rollout status deployment/log-output-dep -n exercises --timeout=120s
kubectl rollout status deployment/greeter-v1 -n exercises --timeout=120s
kubectl rollout status deployment/greeter-v2 -n exercises --timeout=120s
kubectl get pods,svc,httproute,gateway -n exercises
```

## Verify output

```bash
kubectl port-forward svc/log-output-svc 8080:80 -n exercises
```

Open `http://localhost:8080/`. The output includes a line such as:

```text
Greeter: hello from greeter v1
```

or

```text
Greeter: hello from greeter v2
```

Generate traffic by refreshing repeatedly or from another shell:

```bash
for i in $(seq 1 100); do curl -s http://localhost:8080/ | grep Greeter; done
```

The HTTPRoute weights are 75 for `greeter-svc-1` and 25 for `greeter-svc-2`. Use Kiali's Graph view for namespace `exercises` to verify that the traffic is split approximately 75/25.
