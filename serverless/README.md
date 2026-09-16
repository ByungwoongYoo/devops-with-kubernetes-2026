# Exercise 5.6 — Trying serverless with Knative

This branch records the exact local setup and verification procedure for the exercise.

> Runtime note: the repository contains the required installation and verification steps, but no fabricated local runtime transcript is included. Run the commands below on the k3d cluster and submit this branch after the checks pass.

## 1. Recreate k3d without Traefik

```bash
k3d cluster delete
k3d cluster create \
  --port 8082:30080@agent:0 \
  -p 8081:80@loadbalancer \
  --agents 2 \
  --k3s-arg "--disable=traefik@server:0" \
  --image rancher/k3s:v1.34.1-k3s1
kubectl get nodes
```

## 2. Install Knative Serving 1.23.0

The current Knative YAML-install documentation uses `knative-v1.23.0`.

```bash
kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.23.0/serving-crds.yaml
kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.23.0/serving-core.yaml

kubectl apply -f https://github.com/knative-extensions/net-kourier/releases/download/knative-v1.23.0/kourier.yaml

kubectl patch configmap/config-network \
  --namespace knative-serving \
  --type merge \
  --patch '{"data":{"ingress-class":"kourier.ingress.networking.knative.dev"}}'

# Magic DNS / sslip.io
kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.23.0/serving-default-domain.yaml
```

Wait for the control plane and Kourier:

```bash
kubectl wait --for=condition=Available deployment --all -n knative-serving --timeout=180s
kubectl wait --for=condition=Available deployment --all -n kourier-system --timeout=180s
kubectl get pods -n knative-serving
kubectl get pods -n kourier-system
```

If a pod is crashing, inspect the actual error before changing anything:

```bash
kubectl get pods -n knative-serving
kubectl logs -n knative-serving <pod-name> --previous
kubectl describe pod -n knative-serving <pod-name>
```

## 3. Deploy the first Knative Service

```bash
kubectl apply -f serverless/hello.yaml
kubectl get ksvc
```

`hello.yaml` creates a Knative Service named `hello`. Knative creates an immutable Revision, Route and networking resources for it.

To access the service from the host with k3d, first read the Knative URL:

```bash
kubectl get ksvc hello
```

Then use the hostname shown by `kubectl get ksvc` with the k3d load-balancer port, for example:

```bash
curl -H "Host: hello.default.192.168.240.3.sslip.io" http://localhost:8081
```

The exact IP portion can differ between local clusters, so use the hostname reported by the cluster rather than copying the example address blindly.

## 4. Verify autoscaling / scale-to-zero

Knative's default KPA supports scale-to-zero.

```bash
kubectl get pod -l serving.knative.dev/service=hello -w
```

Stop sending traffic and observe the service scale down. Send another request and observe a Revision pod start again.

## 5. Create a second Revision

```bash
kubectl apply -f serverless/hello-v2.yaml
kubectl get revisions
kubectl get ksvc hello
```

## 6. Split traffic between revisions

The traffic manifest assumes the two sequential revisions are `hello-00001` and `hello-00002`. Confirm those names with `kubectl get revisions` first.

```bash
kubectl apply -f serverless/hello-traffic-split.yaml
kubectl get ksvc hello -o yaml
```

Generate repeated requests and verify that both revisions receive traffic.

## Sources

- Knative Serving YAML install: https://knative.dev/docs/install/yaml-install/serving/install-serving-with-yaml/
- Knative Serving installation files / Magic DNS: https://knative.dev/docs/install/yaml-install/serving/serving-installation-files/
- Creating a Knative Service: https://knative.dev/docs/serving/services/creating-services/
- Autoscaling: https://knative.dev/docs/getting-started/first-autoscale/
- Traffic management: https://knative.dev/docs/serving/traffic-management/
