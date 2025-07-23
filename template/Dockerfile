# === Step 1: Build Stage ===
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all project files
COPY . .

# Build the Next.js application
RUN npm run build

# === Step 2: Production Stage ===
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Copy only the build output and required files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./package-lock.json
RUN npm ci --only=production

# Set environment to production
ENV NODE_ENV=production

# Expose application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
