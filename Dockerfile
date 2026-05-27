FROM node:20-slim

# Install dependencies for Chrome Headless Shell
RUN apt-get update && apt-get install -y wget unzip libnss3 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxdamage1 libxext6 libxfixes3 libxrandr2 libxrender1 libxshmfence1 libxtst6 lsb-release --no-install-recommends

# Download and install Chrome Headless Shell version 149.0.7790.0 for linux64
ENV CHROME_VERSION=149.0.7790.0
RUN wget -q https://storage.googleapis.com/chrome-for-testing-public/${CHROME_VERSION}/linux64/chrome-headless-shell-linux64.zip && \
    unzip chrome-headless-shell-linux64.zip && \
    mv chrome-headless-shell-linux64/chrome-headless-shell /usr/bin/chrome-headless-shell && \
    chmod +x /usr/bin/chrome-headless-shell && \
    rm -rf chrome-headless-shell-linux64.zip chrome-headless-shell-linux64

# Set the environment variable for Remotion to use this Chrome
ENV REMOTION_CHROMIUM_PATH=/usr/bin/chrome-headless-shell

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY remotion/package*.json ./remotion/

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p out public

# Copy static assets
COPY static/ ./static/
COPY public/ ./public/

# Use non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Set environment variables for European cloud node
ENV TZ=Europe/Berlin
ENV NODE_ENV=production

# Entry point with memory limit for low-resource ARM instance (Oracle Always Free)
CMD ["node", "--max-old-space-size=256", "render-cloud.js"]