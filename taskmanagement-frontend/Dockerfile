# ======================
# Build stage
# ======================
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ======================
# Production stage
# ======================
FROM node:20-alpine
WORKDIR /app

RUN npm install -g serve

# CRA outputs "build", not "dist"
COPY --from=build /app/build ./build

EXPOSE 7010
CMD ["serve", "-s", "build", "-l", "7010"]
