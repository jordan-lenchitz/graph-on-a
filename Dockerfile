# Stage 1: Build the React app
FROM node:24-slim AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with Node.js
FROM node:24-slim AS run-stage

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY --from=build-stage /app/dist ./dist
COPY server.js ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "server.js"]
