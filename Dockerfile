

# Build stage
FROM node:18-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Build client
WORKDIR /app/client
RUN npm ci && npm run build

# Build server (esbuild must be available)
WORKDIR /app
RUN npm run build

# Production stage
FROM node:18-slim AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist/public ./dist/public
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/index.js"]