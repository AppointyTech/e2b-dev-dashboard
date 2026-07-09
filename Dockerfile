# syntax=docker/dockerfile:1.7

ARG BUN_VERSION=1.2.0

FROM oven/bun:${BUN_VERSION}-alpine AS deps
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:${BUN_VERSION}-alpine AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG BUILD_DATE
ARG BUILD_VERSION
ARG GIT_SHA
ARG NEXT_PUBLIC_E2B_DOMAIN
ARG NEXT_PUBLIC_DASHBOARD_API_URL
ARG NEXT_PUBLIC_INFRA_API_URL
ARG NEXT_PUBLIC_E2B_SANDBOX_URL
ARG NEXT_PUBLIC_ORY_SDK_URL
ARG NEXT_PUBLIC_INCLUDE_BILLING=0
ARG NEXT_PUBLIC_INCLUDE_REPORT_ISSUE=0
ARG NEXT_PUBLIC_INCLUDE_STATUS_INDICATOR=0

ENV BUILD_DATE=${BUILD_DATE} \
    BUILD_VERSION=${BUILD_VERSION} \
    GIT_SHA=${GIT_SHA} \
    VERCEL_GIT_COMMIT_SHA=${GIT_SHA}

# The app validates the full Ory/server env during `prebuild`; these placeholders
# satisfy build-time validation without baking real runtime secrets into the image.
RUN set -eu; \
    export DASHBOARD_API_ADMIN_TOKEN='build-time-placeholder'; \
    export E2B_SESSION_SECRET='0000000000000000000000000000000000000000000000000000000000000000'; \
    export ORY_SDK_URL='https://build-time-placeholder.invalid'; \
    export ORY_OAUTH2_CLIENT_ID='build-time-placeholder'; \
    export ORY_OAUTH2_CLIENT_SECRET='build-time-placeholder'; \
    export ORY_OAUTH2_CLI_CLIENT_ID='build-time-placeholder'; \
    export ORY_OAUTH2_AUDIENCE='build-time-placeholder'; \
    export ORY_PROJECT_API_TOKEN='build-time-placeholder'; \
    export NEXT_PUBLIC_E2B_DOMAIN="${NEXT_PUBLIC_E2B_DOMAIN}"; \
    export NEXT_PUBLIC_DASHBOARD_API_URL="${NEXT_PUBLIC_DASHBOARD_API_URL}"; \
    export NEXT_PUBLIC_INFRA_API_URL="${NEXT_PUBLIC_INFRA_API_URL}"; \
    export NEXT_PUBLIC_ORY_SDK_URL="${NEXT_PUBLIC_ORY_SDK_URL}"; \
    export NEXT_PUBLIC_INCLUDE_BILLING="${NEXT_PUBLIC_INCLUDE_BILLING}"; \
    export NEXT_PUBLIC_INCLUDE_REPORT_ISSUE="${NEXT_PUBLIC_INCLUDE_REPORT_ISSUE}"; \
    export NEXT_PUBLIC_INCLUDE_STATUS_INDICATOR="${NEXT_PUBLIC_INCLUDE_STATUS_INDICATOR}"; \
    if [ -n "${NEXT_PUBLIC_E2B_SANDBOX_URL}" ]; then \
      export NEXT_PUBLIC_E2B_SANDBOX_URL="${NEXT_PUBLIC_E2B_SANDBOX_URL}"; \
    else \
      unset NEXT_PUBLIC_E2B_SANDBOX_URL; \
    fi; \
    bun run build

FROM oven/bun:${BUN_VERSION}-alpine AS runner
WORKDIR /app

ARG BUILD_DATE
ARG BUILD_VERSION
ARG GIT_SHA

LABEL org.opencontainers.image.title="e2b-dashboard" \
      org.opencontainers.image.description="Self-hosted E2B dashboard" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.version="${BUILD_VERSION}"

ENV HOSTNAME=0.0.0.0 \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8080

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production \
    && bun pm cache rm

COPY --from=builder --chown=root:root /app/public ./public
COPY --from=builder --chown=root:root /app/.next ./.next
RUN mkdir -p .next/cache \
    && chown -R 1000:1000 .next/cache

USER 1000:1000
EXPOSE 8080

CMD ["bun", "node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0", "-p", "8080"]
