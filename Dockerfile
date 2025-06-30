ARG IMAGE=node:20-alpine

# COMMON
FROM $IMAGE AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm install
RUN npx prisma generate
COPY . .
RUN npm run build

# DEVELOPMENT
FROM builder AS dev
CMD [""]

# PROD MIDDLE STEP
FROM builder AS prod-build
RUN npm prune --production

# PROD
FROM $IMAGE AS prod
WORKDIR /app
COPY --chown=node:node --from=prod-build /app/dist /app/dist
COPY --chown=node:node --from=prod-build /app/node_modules /app/node_modules
COPY --chown=node:node --from=prod-build /app/package.json /app/
COPY --chown=node:node --from=prod-build /app/.env /app/dist/.env

ENV NODE_ENV=production

USER node
WORKDIR /app/dist
EXPOSE 8000
ENTRYPOINT ["node", "main.js"]