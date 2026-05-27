FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm ci
# Remotion might need additional dependencies for rendering, but we'll keep it simple for now.
# You can add more dependencies as needed.
CMD ["npm", "run", "start"]