FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/nginx.conf
ADD src/static /var/www/static
RUN rm /etc/nginx/conf.d/default.conf
COPY run-server /usr/local/bin

EXPOSE 80

# USER root
CMD ["run-server"]