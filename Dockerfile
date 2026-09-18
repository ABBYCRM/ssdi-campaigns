# DigitalOcean App Platform — build from the GitHub repo (ABBYCRM/ssdi-campaigns).
FROM node:22-alpine AS build
WORKDIR /app

RUN apk add --no-cache libc6-compat

# package-lock.json is optional; npm install works without it.
COPY package.json ./
# App Platform injects NODE_ENV=production at build time; keep devDependencies
# so Vite / Nitro / Tailwind can compile the site.
RUN npm install --include=dev --no-audit --no-fund

COPY . .

ENV NITRO_PRESET=node-server
ENV VITE_AUTH_ENABLED=false
ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=1536

# SSDI Vapi inbound number (never CaseClosedFL +15615661360). Vite inlines VITE_*.
ARG VITE_PUBLIC_PHONE=
ARG INBOUND_PHONE_NUMBER=
ENV VITE_PUBLIC_PHONE=$VITE_PUBLIC_PHONE
ENV INBOUND_PHONE_NUMBER=$INBOUND_PHONE_NUMBER

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
