# Base image for building the React frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the frontend source code
COPY . .

# Build the Vite React application
RUN npm run build

# Production image using standard Nginx
FROM nginx:alpine

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built assets to Nginx's web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for the web server
EXPOSE 80

# Default Nginx command starts the server
CMD ["nginx", "-g", "daemon off;"]
