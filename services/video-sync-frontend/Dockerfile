# services/video-sync-frontend/Dockerfile

# Use the official Node.js image as the base image
FROM node:21-alpine AS build

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package.json package-lock.json ./

# Install dependencies using --legacy-peer-deps
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Install all necessary dependencies in one command using --legacy-peer-deps
RUN npm install react-app-rewired customize-cra eslint eslint-plugin-react eslint-plugin-jsx-a11y eslint-plugin-import eslint-plugin-react-hooks @typescript-eslint/eslint-plugin @typescript-eslint/parser typescript @babel/plugin-transform-private-property-in-object @babel/plugin-proposal-private-property-in-object --save-dev --legacy-peer-deps

# Run ESLint to fix errors before building
RUN npm run lint

# Build the React application
RUN npm run build

# Use the official Nginx image to serve the React application
FROM nginx:stable-alpine

# Copy the build files to the Nginx HTML directory
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]