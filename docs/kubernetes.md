# Running in Kubernetes

Two images from the root `Dockerfile`: `--target frontend` and `--target backend`.
Build each architecture natively.

| Part     | Port | Command                         | User   |
| -------- | ---- | ------------------------------- | ------ |
| frontend | 3710 | `node .output/server/index.mjs` | `node` |
| backend  | 3711 | `backend` (behind `tini`)       | nobody |

- Probes: `GET /` on each port. There is no dedicated health endpoint.
- Logs go to stderr.
- The frontend is the only part that needs an ingress. It reaches the backend over the cluster network.
- No database, search or cache service, and no volumes. Several replicas are fine, there are no schedulers or bots.
- The backend runs `tini` as the entrypoint, because it ignores SIGTERM as PID 1.

## Environment variables

Names only, none of them hold secrets.

- `HOST`, `PORT`: set by the images to `0.0.0.0` and the port above.
- `SITES_FILE`: path to the sites JSON (`sites.local.json` locally). The request `Host` picks the upstream site from it. Mount it from a ConfigMap.
- `SITE_CACHE_FILE`: where the frontend writes its site cache. Defaults to `.site-cache.json` next to the sites file, so point it at a writable path such as an `emptyDir` when the sites file is a read-only mount.

## Build arguments

`COMMIT_SHA` and `COMMIT_DATE` for the frontend. Without them the build asks git, which the image does not have.
