# Use standard Node.js alpine image for a small footprint
FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy the server source code
COPY . .

# Ensure the app runs on the correct port internally
ENV PORT=5000

# Expose the API port
EXPOSE 5000

# Command to run the Express server
CMD ["node", "server.js"]
