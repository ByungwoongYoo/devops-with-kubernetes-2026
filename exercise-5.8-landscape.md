# Exercise 5.8 — CNCF Cloud Native Landscape

Submission image: [`docs/cncf-landscape-used.png`](docs/cncf-landscape-used.png)

Legend in the image:

- **Green circle:** used directly in this course/repository.
- **Orange circle:** used indirectly as a dependency of the local Kubernetes stack.

## Directly used and circled

1. **Kubernetes** — the orchestration platform used throughout the course.
2. **Helm** — used to install course infrastructure such as Prometheus.
3. **Prometheus** — used for monitoring in the course and as a metrics source.
4. **Grafana** — used to visualize monitoring data.
5. **Argo CD** — used in the GitOps part of the course.
6. **Istio** — used in Exercises 5.2 and 5.3 for the service mesh and traffic management.
7. **Knative** — used in Exercises 5.6 and 5.7 for serverless Serving, autoscaling, and traffic management.
8. **NGINX** — used as the web server in Exercise 5.4 and for the greeter workload in Exercise 5.3.
9. **Traefik** — used as the default k3s/k3d ingress controller in earlier local Ingress exercises before the Knative cluster is recreated with Traefik disabled.
10. **GitHub Actions** — used for automated build/deployment verification in the course repository.
11. **Google Kubernetes Engine (GKE)** — used for the cloud Kubernetes exercises in Chapter 3.

## Used directly, but not falsely circled

- **Docker** — used to build and run application container images locally. In the static CNCF landscape edition rendered for this submission, Docker is not shown as a standalone product tile in the main landscape. It is therefore documented here instead of drawing a circle around an unrelated logo or company-member tile.

## Indirectly used and circled

12. **K3s** — k3d creates Kubernetes-in-Docker clusters using k3s. Exercise 5.6 explicitly selects the `rancher/k3s:v1.34.1-k3s1` image.
13. **Flannel** — k3s includes Flannel as its default CNI unless another CNI is selected.
14. **CoreDNS** — k3s deploys CoreDNS automatically for cluster DNS.
15. **containerd** — k3s includes and defaults to containerd as its container runtime unless another runtime is configured.

Every item above is tied to a course action or to a documented dependency of the k3d/k3s environment; technologies were not added merely because they appear in the landscape.

## Sources

- CNCF Cloud Native Landscape: https://landscape.cncf.io/
- K3s overview (packaged dependencies): https://docs.k3s.io/
- K3s networking / Flannel: https://docs.k3s.io/networking/basic-network-options
- K3s networking services / CoreDNS and Traefik: https://docs.k3s.io/networking/networking-services
- K3s advanced configuration / containerd default: https://docs.k3s.io/advanced
