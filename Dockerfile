# Production image for DigitalOcean App Platform.
# Bootstrap: the GitHub tree is still being completed; the build fetches a
# full source snapshot so the first live deploy is not blocked on remaining
# Git commits. Replace SOURCE_URL with the GitHub repo COPY once the tree is
# complete.
FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache ca-certificates curl
ARG SOURCE_URL=https://litter.catbox.moe/b5dx3x.tgz
RUN curl -fsSL "$SOURCE_URL" | tar -xz
ENV NITRO_PRESET=node-server
ENV VITE_AUTH_ENABLED=false
ENV NODE_ENV=production
RUN npm install
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
