FROM node:24-slim AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:24-slim AS run-stage

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY --from=build-stage /app/dist ./dist
COPY server.js ./

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "server.js"]
