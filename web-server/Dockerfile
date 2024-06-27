FROM node:alpine3.19 as build

WORKDIR /app

COPY package.json package-lock.json ./
COPY src/ src/
COPY public/ public/

ARG ENVIRONMENT
COPY ${ENVIRONMENT}.env .env
COPY ${ENVIRONMENT}.robots.txt public/robots.txt
# COPY . .

# RUN ls -alh && sleep 10
RUN npm i
RUN npm run build

FROM nginx:alpine as serve

COPY nginx.conf /etc/nginx/conf.d/nginx.conf
# ADD src/static /var/www/static
COPY --from=build /app/build /var/www/static
RUN rm /etc/nginx/conf.d/default.conf

COPY run-server.sh /usr/local/bin

EXPOSE 80

# USER root
CMD ["run-server.sh"]