FROM node:18-alpine

WORKDIR /app

# 使用私有源（在隔离内网环境中，请确保该地址指向内网私有 npm 缓存源）
RUN npm config set registry https://registry.npmmirror.com

# 先复制清单文件，便于 docker layer 缓存
COPY package*.json ./

# 仅依赖私有源里已缓存的依赖（不新增任何包），优先离线，减少网络请求
RUN npm install --omit=dev --prefer-offline --no-audit --loglevel=error

# 复制其余源码（node_modules 已在 .dockerignore 中排除，使用容器内安装结果）
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
