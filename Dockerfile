# Stage 1: Build the Expo web app
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the web app
RUN npm run build:web

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy the build output to Nginx's public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
