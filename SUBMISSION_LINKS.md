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

Runtime verification status:

- Exercises 1.1–1.9: runtime-checked locally.
- Exercises 3.2–3.5: runtime-verified on GKE, including live external routing/application responses.
- Exercise 3.6: GitHub Actions automatic deployment completed successfully against GKE.
- Exercise 3.7: a dedicated `exercise-37-test` branch environment was deployed successfully in its own namespace.
- Exercise 3.8: deleting `exercise-37-test` triggered the cleanup workflow and the corresponding namespace was verified deleted while the `project` namespace remained healthy.
- Exercise 3.1: GKE cluster, PostgreSQL, ping-pong deployment, and LoadBalancer provisioning were exercised as the setup path leading into 3.2; no separate preserved final curl transcript is claimed here.
- Exercise 3.9: README comparison is implemented in the 3.9 snapshot.
- Exercises 3.10–3.12: repository snapshots are prepared; cloud/runtime evidence is added only after the corresponding GKE checks complete.
