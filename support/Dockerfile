FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_URL
ARG VITE_BASE_URL
ARG VITE_SUPPORT_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_SUPPORT_URL=$VITE_SUPPORT_URL

COPY package*.json ./
RUN npm ci --only=production=false
COPY . ./
RUN npm run build:support

RUN mv dist/support/index.html dist/index.html

FROM nginx:alpine AS production
COPY ./support/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
RUN mkdir -p /run/nginx /var/run/nginx
RUN touch /run/nginx.pid
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/run/nginx /run/nginx  /run/nginx.pid  \
    && chmod -R 755 /usr/share/nginx/html

EXPOSE 80
USER nginx
CMD ["nginx", "-g", "daemon off;"]