# Stage 1: 构建阶段
FROM node:22 as builder

WORKDIR /server

RUN npm config set registry https://registry.npmmirror.com/
# 安装 pnpm
RUN npm install -g pnpm pm2
RUN pnpm config set registry https://registry.npmmirror.com/

COPY . .

# 安装依赖并构建
RUN pnpm install && \
    pnpm build

# Stage 2: 运行阶段
FROM node:22

RUN npm install -g pnpm pm2

WORKDIR /server


# 复制构建产物和必要的运行时依赖
COPY --from=builder /server/dist ./dist
COPY --from=builder /server/.env.production ./.env.production
COPY --from=builder /server/package.json ./package.json
COPY --from=builder /server/ecosystem.config.js ./ecosystem.config.js
COPY --from=builder /server/jwt_rsa_key ./jwt_rsa_key
COPY --from=builder /server/keys ./keys
COPY --from=builder /server/static ./static
COPY --from=builder /server/node_modules ./node_modules

EXPOSE 3000

CMD ["pm2-runtime", "start", "./ecosystem.config.js"]