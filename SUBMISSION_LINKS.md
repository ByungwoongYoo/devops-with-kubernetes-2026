# MOOC submission links

The course examples use `tree/<exercise>` links. Matching branch snapshots were created for each exercise:

- Exercise 1.1: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/1.1
- Exercise 1.2: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/1.2
- Exercise 1.3: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/1.3
- Exercise 1.4: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/1.4
- Exercise 1.5: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/1.5
- Exercise 1.6: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/1.6
- Exercise 1.7: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/1.7
- Exercise 1.8: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/1.8
- Exercise 1.9: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/1.9
- Exercise 1.10: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/1.10
- Exercise 1.11: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/1.11
- Exercise 1.12: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/1.12
- Exercise 1.13: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/1.13
- Exercise 2.1: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/2.1
- Exercise 2.2: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/2.2
- Exercise 2.3: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/2.3
- Exercise 2.4: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/2.4
- Exercise 2.5: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/2.5
- Exercise 2.6: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/2.6
- Exercise 2.7: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/2.7
- Exercise 2.8: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/2.8
- Exercise 2.9: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/2.9
- Exercise 2.10: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/2.10
- Exercise 3.1: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/3.1
- Exercise 3.2: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/3.2
- Exercise 3.3: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/3.3
- Exercise 3.4: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/3.4
- Exercise 3.5: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/3.5
- Exercise 3.6: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/3.6
- Exercise 3.7: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/3.7
- Exercise 3.8: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/3.8
- Exercise 3.9: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/3.9
- Exercise 3.10: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/3.10
- Exercise 3.11: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/3.11
- Exercise 3.12: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/3.12
- Exercise 4.1: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/4.1
- Exercise 4.2: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/4.2
- Exercise 4.3: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/4.3
- Exercise 4.4: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/4.4
- Exercise 4.5: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/4.5
- Exercise 4.6: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/4.6
- Exercise 4.7: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/4.7
- Exercise 4.8: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/4.8
- Exercise 4.9: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/4.9
- Exercise 4.10: https://github.com/ByungwoongYoo/devops-with-kubernetes-2026/tree/4.10

Runtime verification status:

- Exercises 1.1–1.9: runtime-checked locally.
- Exercises 3.2–3.5: runtime-verified on GKE, including live external routing/application responses.
- Exercise 3.6: GitHub Actions automatic deployment completed successfully against GKE.
- Exercise 3.7: a dedicated `exercise-37-test` branch environment was deployed successfully in its own namespace.
- Exercise 3.8: deleting `exercise-37-test` triggered the cleanup workflow and the corresponding namespace was verified deleted while the `project` namespace remained healthy.
- Exercise 3.1: GKE cluster, PostgreSQL, ping-pong deployment, and LoadBalancer provisioning were exercised as the setup path leading into 3.2; no separate preserved final curl transcript is claimed here.
- Exercise 4.7: GitOps release workflow was executed successfully through image build/push and the Git desired-state update; no CI-side `kubectl apply` is used.
- Exercise 4.8: project GitOps release workflow was executed successfully through image build/push and Git desired-state update; ArgoCD application definition is included.
- Exercise 4.9: staging/production overlays and declarative ArgoCD applications are defined; main maps to staging and tags map to production in the workflow. Cluster-side ArgoCD reconciliation is not claimed as runtime-verified here.
- Exercise 4.10: the application-source workflow is prepared to update a separate `ByungwoongYoo/devops-with-kubernetes-2026-config` repository. The separate repository must exist and provide a write credential before this final split can run end to end.
