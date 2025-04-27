# Multi-stage build for AppointEase
# Stage 1: Build stage - builds both frontend and backend
FROM node:20-slim AS builder

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application (Vite frontend + esbuild for server)
RUN npm run build

# Stage 2: Runtime stage - smaller image with only production dependencies
FROM node:20-slim AS runtime

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Create uploads directory
RUN mkdir -p uploads

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Start the application
CMD ["node", "dist/index.js"]