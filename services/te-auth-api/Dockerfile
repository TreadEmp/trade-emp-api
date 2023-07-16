FROM node:16-alpine
EXPOSE 8091
WORKDIR /usr/src/app
RUN mkdir /usr/src/app/src
RUN mkdir /usr/src/app/src/uploads
RUN chmod -R 777 /usr/src/app/src/uploads/
COPY  ./node_modules node_modules
COPY  ./dist dist
COPY  ./package.json package.json
ENV PORT=8091
USER node
CMD ["node", "./dist/app.js"]