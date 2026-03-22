FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# download deps for running the server
FROM base AS prod-deps
WORKDIR /app
COPY package.json package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod

# build the server
FROM prod-deps AS build
WORKDIR /app
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
RUN pnpm run build

FROM base AS deploy
WORKDIR /app
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY health-check.js .
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD ["node", "health-check.js"]
EXPOSE 3000
CMD ["node", "/app/dist/src/main.js"]
