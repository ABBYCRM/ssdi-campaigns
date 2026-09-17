# Production image for DigitalOcean App Platform.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
ENV NITRO_PRESET=node-server
ENV VITE_AUTH_ENABLED=false
ENV NODE_ENV=production
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080
ENV NITRO_PRESET=node-server
ENV VITE_AUTH_ENABLED=false
COPY --from=build /app/.output ./.output
EXPOSE 8080
CMD ["node", ".output/server/index.mjs"]
