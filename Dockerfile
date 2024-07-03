FROM node:20-alpine

USER node

WORKDIR /app

COPY --chown=node:node package.json package.json

RUN npm install && npm cache clean --force

COPY --chown=node:node . .

CMD [ "node", "src/main.js" ]