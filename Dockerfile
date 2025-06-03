FROM oven/bun:1.2.15 AS base-builder
WORKDIR /usr/src/app

# By copying only the package.json and package-lock.json here, we ensure that the following `-deps` steps are independent of the source code.
# Therefore, the `-deps` steps will be skipped if only the source code changes.
COPY package.json bun.lock ./

FROM base-builder AS prod-deps
RUN bun install --frozen-lockfile --production

FROM base-builder AS build-deps
RUN bun install --frozen-lockfile

FROM build-deps AS build
COPY . .
RUN bun run build

# Runner image
FROM oven/bun:1.2.15-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/bun/app && chown -R bun:bun /home/bun/app
WORKDIR /home/bun/app
USER bun

COPY --from=prod-deps --chown=bun:bun /usr/src/app/node_modules ./node_modules
COPY --from=build --chown=bun:bun /usr/src/app/dist ./dist
COPY --chown=bun:bun server.mjs .

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
ENTRYPOINT [ "dumb-init", "--" ]
CMD ["bun", "./server.mjs"]