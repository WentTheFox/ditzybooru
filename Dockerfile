# Two images from one file: `--target frontend` and `--target backend`.
# Build each architecture natively, no cross-compilation.

# ---- frontend: TanStack Start on a Nitro Node server (BUILD_TARGET=node) ----
FROM node:24-bookworm-slim AS frontend-build
WORKDIR /src
# The pnpm version comes from `packageManager` in package.json.
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json frontend/
COPY api/package.json api/
RUN pnpm install --frozen-lockfile
COPY frontend frontend
COPY api api
# Without these the build asks git, which the image does not have.
ARG COMMIT_SHA
ARG COMMIT_DATE
ENV BUILD_TARGET=node COMMIT_SHA=${COMMIT_SHA} COMMIT_DATE=${COMMIT_DATE}
RUN pnpm run build

FROM node:24-bookworm-slim AS frontend
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3710
# The server runs from `frontend/` and reads `../sites.local.json` unless
# SITES_FILE says otherwise. It also writes `.site-cache.json` next to that file.
WORKDIR /app/frontend
COPY --from=frontend-build /src/frontend/.output .output
USER node
EXPOSE 3710
CMD ["node", ".output/server/index.mjs"]

# ---- backend: Rust Philomena API mapper ----
# `rust-toolchain.toml` pins the toolchain, rustup fetches it on first use.
FROM rust:1-bookworm AS backend-build
WORKDIR /src
COPY Cargo.toml Cargo.lock rust-toolchain.toml ./
COPY backend backend
COPY api/openapi.json api/openapi.json
RUN cargo build --release --locked --bin backend

FROM debian:bookworm-slim AS backend
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates tini \
 && rm -rf /var/lib/apt/lists/*
COPY --from=backend-build /src/target/release/backend /usr/local/bin/backend
ENV HOST=0.0.0.0 PORT=3711
USER nobody
EXPOSE 3711
# The server does not handle SIGTERM as PID 1, tini forwards it.
ENTRYPOINT ["tini", "--"]
CMD ["backend"]
