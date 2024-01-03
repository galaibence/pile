FROM node:lts-alpine

WORKDIR /tmp
COPY database database/
COPY data data/
RUN npm install pg @nearform/sql

CMD ["node", "database/bootstrap.js"]
