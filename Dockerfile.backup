# Multi-stage Dockerfile for Poker App - DISABLED FOR RAILWAY
# Railway should use nixpacks.toml instead
FROM node:18-alpine as base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Clean install all dependencies
RUN rm -rf node_modules package-lock.json && \
    npm cache clean --force && \
    npm install --include=optional

# Copy source code
COPY . .

# Build client
RUN cd client && \
    rm -rf node_modules package-lock.json && \
    npm install --include=optional && \
    npm run build

# Build server
RUN cd server && \
    rm -rf node_modules package-lock.json && \
    npm install --include=optional && \
    npm run build

# Production stage
FROM node:18-alpine as production

# Install dumb-init
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy built application
COPY --from=base --chown=nodejs:nodejs /app/client/dist ./client/dist
COPY --from=base --chown=nodejs:nodejs /app/server ./server
COPY --from=base --chown=nodejs:nodejs /app/shared ./shared
COPY --from=base --chown=nodejs:nodejs /app/package*.json ./

# Install production dependencies only
RUN npm ci --only=production --include=optional && \
    npm cache clean --force

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 4000

# Health check disabled - Railway handles this
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#     CMD curl -f http://localhost:4000/ || exit 1

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/dist/index.js"]
