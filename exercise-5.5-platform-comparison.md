# Exercise 5.5 — Platform comparison

I would choose **Rancher over OpenShift** for this exercise.

- **Rancher is a better fit when the main goal is managing Kubernetes clusters across different environments.** Rancher is designed around managing downstream Kubernetes clusters and supports common distributions and managed services such as RKE2, K3s, EKS, GKE and AKS.
- **It is less opinionated about the underlying Kubernetes environment.** I can keep using lightweight/local setups such as k3d/k3s and still use the same management layer for other clusters.
- **It has a lower barrier for a small team or learning environment.** I can start with the open-source Rancher stack without adopting an entire enterprise platform around the cluster.
- **OpenShift provides a more integrated enterprise platform.** Red Hat describes OpenShift Container Platform as a Kubernetes platform with integrated platform-management, security, lifecycle and hybrid-cloud capabilities.
- **That integration is valuable in a large organization**, especially when standardized operations, compliance and Red Hat support are important.
- **The trade-off is that OpenShift is a larger and more opinionated platform.** For this course and for a small multi-cluster setup, I would rather keep standard Kubernetes and add Rancher as the management layer.
- **Conclusion:** OpenShift would be attractive for an enterprise that wants a tightly integrated supported platform, but for flexibility, lighter-weight adoption and managing heterogeneous Kubernetes clusters, I would pick **Rancher**.

Sources:

- Rancher Manager documentation: https://ranchermanager.docs.rancher.com/
- Rancher managed-cluster best practices: https://ranchermanager.docs.rancher.com/reference-guides/best-practices/rancher-managed-clusters
- Red Hat OpenShift Container Platform overview: https://docs.redhat.com/en/documentation/openshift_container_platform/4.21/html/overview/ocp-overview
