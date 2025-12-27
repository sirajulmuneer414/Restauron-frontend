# --- Stage 1: Build the React app ---
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies (cached when package*.json unchanged)
COPY package.json package-lock.json* yarn.lock* ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:1.27-alpine

# Remove default Nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy build output from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a basic nginx.conf (optional but recommended)
# If you have client-side routing, this ensures all routes go to index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
