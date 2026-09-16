# Exercise 4.4 — Ping-pong canary analysis

The Ping-pong Deployment is replaced by an Argo Rollout. Its canary step sends 50% of the replicas to the new version, pauses briefly, and then runs `ping-pong-cpu-rate`.

The AnalysisTemplate queries the sum of the 5-minute CPU usage rates of all real containers in the `exercises` namespace:

```promql
scalar(
  sum(
    rate(container_cpu_usage_seconds_total{
      namespace="exercises",
      container!="",
      container!="POD",
      image!=""
    }[5m])
  ) or vector(0)
)
```

The normal hardcoded threshold is `0.2` CPU cores. The analysis runs every 30 seconds for 10 measurements (roughly five minutes) and fails the rollout as soon as a measurement is above the threshold.

To demonstrate the failure path, temporarily change the success condition to a deliberately tiny value such as:

```yaml
successCondition: result < 0.000001
```

Then update the Rollout image and watch it:

```bash
kubectl argo rollouts get rollout ping-pong-rollout -n exercises --watch
```

With the deliberately tiny threshold, the AnalysisRun should fail and Argo Rollouts should abort/revert the canary instead of promoting it.
