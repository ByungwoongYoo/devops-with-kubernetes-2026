# Exercise 5.8 — CNCF Cloud Native Landscape

Legend used in `docs/cncf-landscape-used.svg`:

- **Green circle:** used directly in this course/repository.
- **Orange circle:** used indirectly as a dependency of the local Kubernetes stack.

## Directly used

1. **Kubernetes** — the orchestration platform used throughout the course.
2. **Docker** — used to build the application container images locally.
3. **Helm** — used to install course infrastructure such as Prometheus.
4. **Prometheus** — used for monitoring in the course and as the metrics source for Kiali.
5. **Grafana** — used to visualize monitoring data.
6. **Argo CD** — used in the GitOps part of the course.
7. **Istio** — used in Exercises 5.2 and 5.3 for the service mesh, including ambient mode and Gateway API traffic management.
8. **Knative** — used in Exercises 5.6 and 5.7 for serverless Serving, autoscaling and traffic management.
9. **NGINX** — used as the web server in Exercise 5.4 and for the simple greeter workload in Exercise 5.3.
10. **Traefik** — used as the default k3s/k3d ingress controller in the earlier local Ingress exercises before the Knative cluster is recreated with Traefik disabled.
11. **GitHub Actions** — used for the automated deployment workflow in the course repository.
12. **Google Kubernetes Engine (GKE)** — used for the cloud Kubernetes exercises in Chapter 3.

## Indirectly used

13. **K3s** — k3d creates Kubernetes-in-Docker clusters using k3s. Exercise 5.6 explicitly selects the `rancher/k3s:v1.34.1-k3s1` image.
14. **Flannel** — k3s includes Flannel as its default CNI unless another CNI is selected.
15. **CoreDNS** — k3s deploys CoreDNS automatically for cluster DNS.
16. **containerd** — k3s includes and defaults to containerd as its container runtime unless another runtime is configured.

I did not add technologies merely because they appear in the landscape; every item above is tied to a course action or to a documented dependency of the k3d/k3s environment.

## Sources

- CNCF Cloud Native Landscape: https://landscape.cncf.io/
- K3s overview (packaged dependencies): https://docs.k3s.io/
- K3s networking / Flannel: https://docs.k3s.io/networking/basic-network-options
- K3s networking services / CoreDNS and Traefik: https://docs.k3s.io/networking/networking-services
- K3s advanced configuration / containerd default: https://docs.k3s.io/advanced
