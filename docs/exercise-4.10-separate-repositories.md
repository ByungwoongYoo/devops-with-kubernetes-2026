# Exercise 4.10 — Separate source and configuration repositories

Application source lives in:

- https://github.com/ByungwoongYoo/devops-with-kubernetes-2026

Kubernetes/GitOps desired state lives in a separate repository:

- https://github.com/ByungwoongYoo/devops-with-kubernetes-2026-config

The source repository workflow builds and pushes the application images to Artifact Registry. It then checks out the configuration repository and updates only the image references in `overlays/staging` or `overlays/production`.

ArgoCD watches the configuration repository and owns cluster reconciliation. CI does not run `kubectl apply`.

Environment mapping:

- push to `main` -> staging desired state
- Git tag -> production desired state

The PostgreSQL Secret is intentionally not stored in either Git repository. It must be provisioned out-of-band in the target namespace.

For cross-repository writes, the application repository workflow expects a GitHub Actions secret named `CONFIG_REPO_TOKEN` with Contents write permission limited to `ByungwoongYoo/devops-with-kubernetes-2026-config`.
