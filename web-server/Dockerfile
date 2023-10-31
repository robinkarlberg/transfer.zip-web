FROM nginx:alpine

ARG USE_INCLUDES=false

COPY nginx.conf /etc/nginx/conf.d/nginx.conf
ADD src/static /var/www/static
RUN rm /etc/nginx/conf.d/default.conf

ADD includes /tmp/includes
COPY build-html.sh /tmp
RUN /tmp/build-html.sh $USE_INCLUDES

COPY run-server.sh /usr/local/bin

EXPOSE 80

# USER root
CMD ["run-server.sh"]