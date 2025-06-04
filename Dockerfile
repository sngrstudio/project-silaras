FROM node:22.16.0-bookworm AS base-builder
WORKDIR /usr/src/app

# By copying only the package.json and package-lock.json here, we ensure that the following `-deps` steps are independent of the source code.
# Therefore, the `-deps` steps will be skipped if only the source code changes.
COPY package.json package-lock.json* ./

FROM base-builder AS prod-deps
RUN npm ci --omit=dev

FROM base-builder AS build-deps
RUN npm ci

FROM build-deps AS build
# Copy configuration files first (these change less frequently)
COPY astro.config.mjs drizzle.config.mjs tsconfig.json prettier.config.cjs .prettierignore ./
COPY node.d.ts ./

# Copy source code
COPY src/ ./src/
COPY public/ ./public/

# Run the build - this layer will be cached unless:
# - Dependencies changed (invalidating build-deps)
# - Configuration files changed
# - Source code in src/ or public/ changed
RUN npm run build

# Runner image
FROM node:22.16.0-bookworm-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app
USER node

COPY --from=prod-deps --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=build --chown=node:node /usr/src/app/dist ./dist
COPY --chown=node:node server.mjs .

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
ENTRYPOINT [ "dumb-init", "--" ]
CMD ["node", "./server.mjs"]
