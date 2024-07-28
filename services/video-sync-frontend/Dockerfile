# Build stage
FROM node:21-alpine AS build

WORKDIR /app

# Debugging: Print Node.js and npm versions
RUN node --version && npm --version

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Debugging: List contents of /app
RUN ls -la

RUN npm install react-app-rewired customize-cra eslint eslint-plugin-react eslint-plugin-jsx-a11y eslint-plugin-import eslint-plugin-react-hooks @typescript-eslint/eslint-plugin @typescript-eslint/parser typescript @babel/plugin-transform-private-property-in-object @babel/plugin-proposal-private-property-in-object --save-dev --legacy-peer-deps

# Debugging: List installed packages
RUN npm list

RUN npm run lint
RUN npm run build

# Debugging: List contents of /app/build
RUN ls -la build

# Serve stage
FROM nginx:stable-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Debugging: List contents of /usr/share/nginx/html
RUN ls -la /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]