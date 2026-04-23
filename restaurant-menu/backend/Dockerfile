FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Seeder stage: keeps full deps + source so ts-node can run seed.ts
FROM node:20-alpine AS seeder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "run", "seed"]

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
RUN mkdir -p uploads
EXPOSE 3000
CMD ["node", "dist/main"]
