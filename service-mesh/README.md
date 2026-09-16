# Exercise 5.2 — Getting started with Istio service mesh

This branch contains a reproducible setup for the course exercise using Istio ambient mode on k3d.

## 1. Create the k3d cluster

Istio's k3d prerequisites require Traefik to be disabled and the k3d platform override to be used during installation.

```bash
k3d cluster delete
k3d cluster create --api-port 6550 \
  -p '9080:80@loadbalancer' \
  -p '9443:443@loadbalancer' \
  --agents 2 \
  --k3s-arg '--disable=traefik@server:*'
```

## 2. Install Istio CLI and ambient mode

```bash
curl -L https://istio.io/downloadIstio | sh -
cd istio-*
export PATH="$PWD/bin:$PATH"

istioctl install \
  --set profile=ambient \
  --set values.global.platform=k3d \
  --skip-confirmation
```

Install the Kubernetes Gateway API CRDs if they are not already present:

```bash
kubectl get crd gateways.gateway.networking.k8s.io >/dev/null 2>&1 || \
  kubectl apply --server-side -f \
  https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.6.0/experimental-install.yaml
```

Verify Istio:

```bash
kubectl get pods -n istio-system
istioctl version
```

## 3. Deploy the Bookinfo sample

Run these commands from the extracted Istio release directory:

```bash
kubectl apply -f samples/bookinfo/platform/kube/bookinfo.yaml
kubectl apply -f samples/bookinfo/platform/kube/bookinfo-versions.yaml
kubectl apply -f samples/bookinfo/gateway-api/bookinfo-gateway.yaml
kubectl annotate gateway bookinfo-gateway \
  networking.istio.io/service-type=ClusterIP \
  --namespace=default

kubectl label namespace default istio.io/dataplane-mode=ambient --overwrite
kubectl get pods
kubectl get gateway
```

Access the app:

```bash
kubectl port-forward svc/bookinfo-gateway-istio 8080:80
```

Open `http://localhost:8080/productpage`.

## 4. Prometheus and Kiali

The course environment uses Prometheus in the `monitoring` namespace. Configure Kiali to use:

```yaml
prometheus:
  enabled: true
  url: http://prom-prometheus-server.monitoring:80
```

After Kiali is installed, open it with:

```bash
istioctl dashboard kiali
```

Use the Graph view to inspect Bookinfo traffic in the ambient mesh.

## 5. Cleanup

```bash
kubectl delete httproute reviews --ignore-not-found
kubectl delete authorizationpolicy productpage-viewer --ignore-not-found
kubectl delete -f samples/curl/curl.yaml --ignore-not-found
kubectl delete -f samples/bookinfo/platform/kube/bookinfo.yaml --ignore-not-found
kubectl delete -f samples/bookinfo/platform/kube/bookinfo-versions.yaml --ignore-not-found
kubectl delete -f samples/bookinfo/gateway-api/bookinfo-gateway.yaml --ignore-not-found
```

References:

- https://istio.io/latest/docs/ambient/getting-started/
- https://istio.io/latest/docs/ambient/install/platform-prerequisites/#k3d
- https://istio.io/latest/docs/ambient/getting-started/deploy-sample-app/
