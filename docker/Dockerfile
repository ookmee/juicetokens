FROM node:18-alpine as base

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build TypeScript code
RUN npm run build

# Create a smaller production image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built application from base stage
COPY --from=base /app/dist ./dist
COPY --from=base /app/public ./public
COPY --from=base /app/docker/test-env-entrypoint.sh ./entrypoint.sh

# Add mongo client for persistence layer
RUN apk add --no-cache mongodb-tools

# Environment variables
ENV NODE_ENV=test \
    MOCK_MODE=true \
    MONGODB_URI=mongodb://mongodb:27017/juicetokens \
    USER_ID=test-user \
    CONTAINER_ID=local \
    PORT=8080

# Make entrypoint script executable
RUN chmod +x ./entrypoint.sh

# Expose the application port
EXPOSE 8080

# Start the application
ENTRYPOINT ["./entrypoint.sh"] 