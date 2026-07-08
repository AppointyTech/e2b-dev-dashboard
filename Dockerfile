# syntax=docker/dockerfile:1.7

FROM oven/bun:1.2-slim@sha256:9654aa08d4b7e778b84148921bab8edc1409c8d0a85707b8c801dd7cf1878971 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
RUN --mount=type=cache,id=bun,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env: only NEXT_PUBLIC_* values are inlined into the client
# bundle and need real values at build time. The server-only vars below
# only need to be present and non-empty to satisfy the Zod validation that
# `prebuild` (scripts/check-app-env.ts) runs before `next build`; their
# real values are injected at container runtime via Kubernetes env/secrets,
# never baked into the image.
# Only NEXT_PUBLIC_E2B_DOMAIN is given a default: it has no .optional() in
# the Zod schema, so it must always resolve to a non-empty value. The rest
# are genuinely optional in the schema (.optional()/.url().optional() etc)
# but Zod rejects an *empty string* as an invalid value for those
# constraints — so unlike env vars left unset, an empty-string default
# baked in via `ENV FOO=${FOO}` would fail validation. Passing them through
# a shell RUN step (rather than ENV) lets an unset ARG stay genuinely unset
# in process.env for the build.
ARG NEXT_PUBLIC_E2B_DOMAIN=e2b.dev
ENV NEXT_PUBLIC_E2B_DOMAIN=${NEXT_PUBLIC_E2B_DOMAIN}

ARG NEXT_PUBLIC_DASHBOARD_API_URL
ARG NEXT_PUBLIC_INFRA_API_URL
ARG NEXT_PUBLIC_E2B_SANDBOX_URL
ARG NEXT_PUBLIC_ORY_SDK_URL
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_INCLUDE_BILLING
ARG NEXT_PUBLIC_INCLUDE_ARGUS
ARG NEXT_PUBLIC_INCLUDE_REPORT_ISSUE
ARG NEXT_PUBLIC_INCLUDE_STATUS_INDICATOR
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Server-only vars required only to pass the Zod `prebuild` gate
# (src/lib/env.ts: oryRequiredEnvVars + validateOryAdminEnv). Real secret
# values are supplied at container runtime via k8s env/secrets, never
# baked into the image.
#
# Cloud Build always passes --build-arg for every substitution, even ones
# that default to '' — so an "optional" NEXT_PUBLIC_* var can arrive as an
# explicitly empty string, not merely unset. Zod's .url()/.min(1) reject ""
# the same as an invalid value (unlike a genuinely absent key), so each var
# is unset here when empty rather than exported, keeping it truly absent
# from process.env for the build.
RUN --mount=type=cache,id=bun-build,target=/app/.next/cache \
    [ -z "${NEXT_PUBLIC_DASHBOARD_API_URL}" ] && unset NEXT_PUBLIC_DASHBOARD_API_URL; \
    [ -z "${NEXT_PUBLIC_INFRA_API_URL}" ] && unset NEXT_PUBLIC_INFRA_API_URL; \
    [ -z "${NEXT_PUBLIC_E2B_SANDBOX_URL}" ] && unset NEXT_PUBLIC_E2B_SANDBOX_URL; \
    [ -z "${NEXT_PUBLIC_ORY_SDK_URL}" ] && unset NEXT_PUBLIC_ORY_SDK_URL; \
    [ -z "${NEXT_PUBLIC_POSTHOG_KEY}" ] && unset NEXT_PUBLIC_POSTHOG_KEY; \
    [ -z "${NEXT_PUBLIC_INCLUDE_BILLING}" ] && unset NEXT_PUBLIC_INCLUDE_BILLING; \
    [ -z "${NEXT_PUBLIC_INCLUDE_ARGUS}" ] && unset NEXT_PUBLIC_INCLUDE_ARGUS; \
    [ -z "${NEXT_PUBLIC_INCLUDE_REPORT_ISSUE}" ] && unset NEXT_PUBLIC_INCLUDE_REPORT_ISSUE; \
    [ -z "${NEXT_PUBLIC_INCLUDE_STATUS_INDICATOR}" ] && unset NEXT_PUBLIC_INCLUDE_STATUS_INDICATOR; \
    [ -z "${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}" ] && unset NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY; \
    export DASHBOARD_API_ADMIN_TOKEN="build-placeholder"; \
    export E2B_SESSION_SECRET="build-placeholder"; \
    export ORY_SDK_URL="https://build-placeholder.projects.oryapis.com"; \
    export ORY_OAUTH2_CLIENT_ID="build-placeholder"; \
    export ORY_OAUTH2_CLIENT_SECRET="build-placeholder"; \
    export ORY_OAUTH2_CLI_CLIENT_ID="build-placeholder"; \
    export ORY_OAUTH2_AUDIENCE="build-placeholder"; \
    export ORY_PROJECT_API_TOKEN="build-placeholder"; \
    bun run build

FROM oven/bun:1.2-slim@sha256:9654aa08d4b7e778b84148921bab8edc1409c8d0a85707b8c801dd7cf1878971 AS runner
WORKDIR /app

ARG BUILD_DATE=unknown
ARG GIT_SHA=unknown
ARG BUILD_VERSION=dev

LABEL org.opencontainers.image.title="E2B Dashboard" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.version="${BUILD_VERSION}" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.source="https://github.com/AppointyTech/e2b-dev-dashboard" \
      org.opencontainers.image.authors="team-devops@appointy.com" \
      org.opencontainers.image.licenses="LicenseRef-Proprietary"

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=8080

# Next.js standalone output is a self-contained server + traced node_modules
# subset. public/ and .next/static are not included in .next/standalone by
# design and must be copied in separately.
COPY --from=builder --chown=bun:bun /app/.next/standalone ./
COPY --from=builder --chown=bun:bun /app/.next/static ./.next/static
COPY --from=builder --chown=bun:bun /app/public ./public

USER bun

EXPOSE 8080
CMD ["bun", "server.js"]
