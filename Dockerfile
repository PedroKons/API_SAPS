# Use Node.js 20 Alpine as base image
FROM node:20-alpine

# Instale o OpenSSL e compatibilidade com libssl1.1
RUN apk add --no-cache openssl1.1 || apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the application
CMD ["npm", "start"] 