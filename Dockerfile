FROM node:20-alpine3.16

WORKDIR /app

COPY package.json package.json

RUN npm install

COPY . .

CMD [ "node", "src/server.js" ]