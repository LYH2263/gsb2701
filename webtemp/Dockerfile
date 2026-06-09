FROM node:18-alpine

WORKDIR /app

# Configure npm registry for speed in China
RUN npm config set registry https://registry.npmmirror.com

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
