FROM node:22-bookworm-slim AS deps
WORKDIR /app/src/frontend

COPY src/frontend/package.json src/frontend/package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS builder
WORKDIR /app/src/frontend

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/src/frontend/node_modules ./node_modules
COPY src/frontend ./

RUN npm run build

FROM node:22-bookworm-slim AS final
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
EXPOSE 3000

COPY src/frontend/package.json src/frontend/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/src/frontend/.next ./.next
COPY --from=builder /app/src/frontend/public ./public
COPY --from=builder /app/src/frontend/next.config.ts ./next.config.ts

CMD ["npm", "run", "start"]
