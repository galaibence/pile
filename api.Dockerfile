FROM node:lts-alpine AS BUILD

COPY . .
RUN npm install
RUN npm run build

RUN rm -rf node_modules
RUN npm install --production

FROM node:lts-alpine
COPY --from=BUILD /build /build
COPY --from=BUILD /node_modules /node_modules

CMD ["node", "/build/service.js"]
