FROM node:20-alpine

# Prisma trên Alpine cần OpenSSL + libc6-compat, nếu không sẽ lỗi
# "Could not parse schema engine response" khi khởi động.
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Cài dependencies trước để tận dụng cache
COPY package*.json ./
RUN npm install --omit=dev

# Copy mã nguồn + Prisma
COPY . .
RUN npx prisma generate

EXPOSE 4000

CMD ["node", "src/server.js"]
