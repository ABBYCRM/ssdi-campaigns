# DigitalOcean App Platform — build from the GitHub repo (ABBYCRM/ssdi-campaigns).
FROM node:22-alpine AS build
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
# App Platform injects NODE_ENV=production at build time; keep devDependencies
# so Vite / Nitro / Tailwind can compile the site.
RUN npm ci --include=dev --no-audit --no-fund

COPY . .

ENV NITRO_PRESET=node-server
ENV VITE_AUTH_ENABLED=false
ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=1536

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
