FROM node:alpine3.19

WORKDIR /app

# Need python3 for node-gyp-build (bufferutil)
# RUN apk add --update python3 make g++\
#    && rm -rf /var/cache/apk/*

# Needed for generate keys
RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm i

COPY lib ./lib
COPY worker.js ./

# Copy init script
COPY ./docker-create-keys.sh /app/docker-create-keys.sh
RUN chmod +x /app/docker-create-keys.sh
RUN /app/docker-create-keys.sh

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001

CMD ["npm", "start"]