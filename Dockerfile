# 使用官方的 Node 镜像作为基础镜像
FROM node:16.0.0

# 设置工作目录
WORKDIR /usr/src/app

# 将本地应用程序的 package.json 和 package-lock.json 复制到工作目录
COPY package*.json ./

# 安装应用程序的依赖
RUN npm install --registry=http://registry.npmmirror.com
RUN npm install -g npm@7
# 将本地应用程序代码复制到工作目录
COPY . .

# 暴露容器的端口，如果应用程序监听的是特定的端口，请确保正确设置
EXPOSE 3000

# 运行应用程序
CMD ["npm", "run", "demo"]
