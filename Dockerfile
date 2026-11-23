
# Build Angular
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Configuración Angular: testing o production
ARG BUILD_CONFIGURATION=production

RUN npm run build -- --configuration=${BUILD_CONFIGURATION}

# Servir Angular con Nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
