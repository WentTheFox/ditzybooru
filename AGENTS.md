- Developer may already run `pnpm run dev` server. Never kill it, reuse it.
- Project unreleased: make breaking changes freely for clean code. No backwards compatibility, no deprecations.
- Use regular dash instead of em-dash everywhere.
- Before changing TanStack Router, Start, Query or devtools code, read the matching `frontend/node_modules/@tanstack/*/skills/**/SKILL.md`. It matches the installed version.

## Terminology

- Never say "byte-identical" or "bit identical". Say just "identical" or "equal" or "the same" instead.
- Never say "load-bearing". Say "important" instead.

## Code Conventions

- Never write untyped JavaScript, use TypeScript.
- Avoid premature exports. Only use `export` if another file needs to import something.
- Use `unwrap()` from `lib/assertions` instead of non-null assertions (`!` suffix). Prefer type system that avoids nulls.

## Git

- Write commit messages in the Conventional Commits format.
- Every push to `main` on the fork (`origin`) publishes the container images and rolls them out to production on the cluster. Rollback is a revert on `main`. See `docs/kubernetes.md`.
- `BUILD_TARGET=node` builds a standalone Node server instead of the Cloudflare Worker. The `Dockerfile` sets it for the cluster, so both targets must keep building.
- Multi-site: the request `Host` picks the Philomena origin and branding (`lib/sites.ts`, `sites.local.json`). Never hardcode an origin or the site name in components; use `useSite()`.
