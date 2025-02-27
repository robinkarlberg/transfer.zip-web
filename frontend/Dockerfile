# Use an official Node.js image for building the app
FROM node:lts-alpine3.19 AS build

WORKDIR /app

# Copy package.json and package-lock.json first and install dependencies
COPY package.json package-lock.json ./

# Install dependencies (this step will be cached unless package.json or package-lock.json changes)
RUN npm i

# Copy the rest of the application files
COPY tailwind.config.js ./tailwind.config.js
COPY src/ src/
COPY public/ public/
COPY .env .env
# COPY . .

# Build the application
RUN npm run build

# Use a lightweight Nginx image to serve the built files
FROM nginx:alpine AS serve

COPY nginx.conf /etc/nginx/conf.d/nginx.conf
COPY --from=build /app/build /var/www/static
RUN rm /etc/nginx/conf.d/default.conf

COPY run-server.sh /usr/local/bin

EXPOSE 80

CMD ["run-server.sh"]
