# syntax=docker/dockerfile:1
FROM node:24-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY . .
RUN npm ci
RUN npm run build

FROM build AS migrate
WORKDIR /app/apps/api
CMD ["npm", "run", "db:deploy"]

FROM build AS api-dependencies
RUN npm prune --omit=dev --ignore-scripts

FROM node:24-bookworm-slim AS api
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=api-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=api-dependencies --chown=node:node /app/packages ./packages
COPY --from=api-dependencies --chown=node:node /app/apps/api/package.json ./apps/api/package.json
COPY --from=api-dependencies --chown=node:node /app/apps/api/dist ./apps/api/dist
RUN mkdir -p /app/apps/api/.data/media && chown -R node:node /app/apps/api/.data
USER node
WORKDIR /app/apps/api
EXPOSE 4000
CMD ["node", "dist/main.js"]

FROM node:24-bookworm-slim AS web
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
COPY --from=build --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=node:node /app/apps/web/public ./apps/web/public
USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]

