# Exercise 5.7 — Deploy Ping-pong to serverless

The regular Kubernetes `Deployment` and standalone `Service` for Ping-pong have been replaced with `ping-pong/manifests/knative-service.yaml`.

The Ping-pong process itself is HTTP-triggered and stores its persistent counter in PostgreSQL, so application state is outside the Knative Revision.

The Log Output app calls the Knative service with the fully qualified Kubernetes DNS name required by the exercise:

```text
http://pingpong.exercises.svc.cluster.local/pings
```

## Local deployment

Knative Serving + Kourier from Exercise 5.6 must already be running.

```bash
# Build/import the existing Ping-pong image into the local k3d cluster if needed.
docker build -t dwk-ping-pong:2.7 ./ping-pong
k3d image import dwk-ping-pong:2.7 -c k3s-default

# External state used by the serverless Ping-pong Revision.
kubectl apply -f ping-pong/manifests/postgres.yaml

# Knative Service (creates the Knative Route/Configuration/Revision and service networking).
kubectl apply -f ping-pong/manifests/knative-service.yaml

kubectl get ksvc -n exercises
kubectl get revisions -n exercises
kubectl get pods -n exercises
```

Expected service name: `pingpong`.

After the Knative service is Ready, deploy/restart Log Output so it uses the new FQDN:

```bash
kubectl apply -f log-output/manifests/configmap.yaml
kubectl apply -f log-output/manifests/deployment.yaml
kubectl apply -f log-output/manifests/service.yaml
kubectl rollout restart deployment/log-output-dep -n exercises
```

Verify that the Log Output response can read the Ping-pong counter, and separately call the Knative service using the hostname reported by:

```bash
kubectl get ksvc pingpong -n exercises
```

Knative can scale the Ping-pong Revision to zero when idle and create a pod again when HTTP traffic arrives.

Source: https://knative.dev/docs/serving/convert-deployment-to-knative-service/
