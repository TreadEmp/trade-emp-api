FROM node:12-slim
EXPOSE 8090

WORKDIR /usr/src/app
RUN mkdir /usr/src/app/common
RUN mkdir /usr/src/app/common/util

#build utils
COPY ./common/util ./common/util
COPY ./common/util/package.json ./common/util/package.json
COPY ./common/util/tsconfig.json ./common/util/tsconfig.json

WORKDIR /usr/src/app/common/util
RUN touch yarn.lock
RUN chmod -R 777 yarn.lock
RUN yarn install
RUN yarn build

WORKDIR /usr/src/app
RUN mkdir /usr/src/app/src
RUN mkdir /usr/src/app/src/uploads
RUN chmod -R 777 /usr/src/app/src/uploads/
COPY ./services/te-base-api/env/dev/package.json ./
COPY ./services/te-base-api/tsconfig.json ./

RUN yarn add ./common/util
# RUN yarn install
COPY ./services/te-base-api ./
RUN yarn build
ENV PORT=8090
USER node
CMD ["node", "./dist/app.js"]