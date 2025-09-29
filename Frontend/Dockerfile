# Stage 1 - Build frontend (can be done on modern machine)
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_BASE_URL
ENV VITE_BASE_URL=$VITE_BASE_URL
RUN npm run build

# Stage 2 - Serve with serve package
FROM node:18-alpine
COPY --from=build /app/dist /app/dist
RUN npm install -g serve
EXPOSE 6000
# Add --single flag for SPA routing and configure for subpath
CMD ["serve", "-s", "/app/dist", "-l", "6000", "--single"]