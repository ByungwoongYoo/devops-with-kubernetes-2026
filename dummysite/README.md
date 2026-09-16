# Exercise 5.1 — DIY CRD & Controller

This directory contains a self-contained `DummySite` implementation for the
University of Helsinki DevOps with Kubernetes 2026 course.

A `DummySite` custom resource has one field, `spec.website_url`. The controller
watches `DummySite` resources, downloads the requested HTML page, stores it in a
ConfigMap, and creates an nginx Deployment and Service that serve the copied
HTML. The generated resources use an owner reference to the `DummySite`, so
Kubernetes garbage collection removes them when the custom resource is deleted.

## Apply

```bash
kubectl apply -f dummysite/manifests/crd.yaml
kubectl wait --for=condition=Established crd/dummysites.stable.dwk --timeout=60s

kubectl apply -f dummysite/manifests/controller.yaml
kubectl rollout status deployment/dummysite-controller --timeout=120s

kubectl apply -f dummysite/manifests/example.yaml
```

## Verify

```bash
kubectl get dummysites
kubectl get configmap,deployment,service | grep dummysite-example-com
kubectl logs deployment/dummysite-controller
```

To inspect the copied `https://example.com/` page:

```bash
kubectl port-forward service/dummysite-example-com 8080:80
```

Then open `http://localhost:8080/` or run:

```bash
curl http://localhost:8080/
```

The controller itself uses only Python's standard library and is mounted from a
ConfigMap, so no custom controller image or external Python package is required.
