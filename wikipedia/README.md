# Exercise 5.4 — Wikipedia with init and sidecar

The deployment has three containers sharing one `emptyDir` volume:

- init container: downloads `https://en.wikipedia.org/wiki/Kubernetes` to `/www/index.html` before nginx starts
- main container: nginx serves the shared directory
- sidecar: waits a random 300–900 seconds (5–15 minutes), downloads `https://en.wikipedia.org/wiki/Special:Random`, and stores it as `/www/random.html`

Deploy and verify:

```bash
kubectl apply -f wikipedia/manifests.yaml
kubectl rollout status deployment/wikipedia-app -n exercises --timeout=120s
kubectl get pods -n exercises
kubectl port-forward svc/wikipedia-svc 8080:80 -n exercises
```

Open:

- `http://localhost:8080/` for the Kubernetes Wikipedia page fetched by the init container
- `http://localhost:8080/random.html` after the sidecar has completed its first random fetch

Sidecar logs show the selected random delay and each successful update:

```bash
kubectl logs -n exercises deployment/wikipedia-app -c wikipedia-random-sidecar -f
```
