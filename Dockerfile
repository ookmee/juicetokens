FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY packages/*/package.json ./packages/
RUN find packages -maxdepth 1 -mindepth 1 -type d -exec mkdir -p {}/dist \;
RUN npm install

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Expose port for the service
EXPOSE 4242

# Start the service
CMD ["node", "packages/app/dist/index.js"] 