FROM node:12

WORKDIR /usr/src/ancubedtgbot

COPY package*.json ./

RUN npm install

ENV NODE_ENV=production

COPY . .

RUN mkdir tmp

EXPOSE 3000

CMD [ "node", "index.js" ]