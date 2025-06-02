FROM oven/bun:1.2.15 AS base
WORKDIR /app

# By copying only the package.json and package-lock.json here, we ensure that the following `-deps` steps are independent of the source code.
# Therefore, the `-deps` steps will be skipped if only the source code changes.
COPY package.json bun.lock ./

FROM base AS prod-deps
RUN bun install --frozen-lockfile --production

FROM base AS build-deps
RUN bun install --frozen-lockfile

FROM build-deps AS build
COPY . .
RUN bun run build

FROM oven/bun:1.2.15-slim AS runtime
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY server.mjs .

USER bun
ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
CMD ["bun", "./server.mjs"]