FROM node:alpine3.19

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm i

COPY index.js ./

EXPOSE 8001

CMD ["npm", "start"]
