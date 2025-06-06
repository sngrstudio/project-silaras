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
COPY astro.config.mjs drizzle.config.mjs tsconfig.json prettier.config.cjs .prettierignore node.d.ts ./

# Copy source code
COPY src/ ./src/
COPY public/ ./public/

# Run the build - this layer will be cached unless:
# - Dependencies changed (invalidating build-deps)
# - Configuration files changed
# - Source code in src/ or public/ changed
RUN npm run build

# Runner image - using distroless for security
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runtime

# Set working directory (distroless already has /home/nonroot with correct permissions)
WORKDIR /home/nonroot/app

# Copy application files
COPY --from=prod-deps --chown=nonroot:nonroot /usr/src/app/node_modules ./node_modules
COPY --from=build --chown=nonroot:nonroot /usr/src/app/dist ./dist
COPY --chown=nonroot:nonroot server.mjs .

# Environment variables
ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production

# Expose port
EXPOSE 4321

# Distroless already runs as nonroot user, and Node.js handles signals properly in distroless
CMD ["server.mjs"]
