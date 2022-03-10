FROM node:16 AS client
WORKDIR /usr/src/app
COPY client/ ./appauth/
RUN cd appauth && npm install && npm run build

FROM node:16 AS server
WORKDIR /root/
COPY --from=client /usr/src/app/appauth/build ./app
COPY ./api ./
RUN npm ci --only=production && npm cache clean --force

CMD ["node", "./index.js"]

