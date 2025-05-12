FROM node:20-slim

WORKDIR /app

# Install protoc and protoc-gen-js
RUN apt-get update && apt-get install -y \
    protobuf-compiler \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g protoc-gen-js

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate protobuf files
RUN npm run proto

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
