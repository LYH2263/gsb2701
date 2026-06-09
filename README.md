# 中华美食 (Chinese Cuisine) Full Stack App [Enterprise Edition]

## 项目简介
这是一个基于 Node.js + Express + SQLite (Sequelize) 的全栈“中华美食”主题网站。项目严格遵循“Zero Mock”和“Docker All-in-One”规范，并采用了企业级的 **MVC 架构**。

## 🛠 技术栈
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (Fetch API)
- **Backend Architecture**: MVC (Model-View-Controller)
- **Framework**: Express.js
- **Database**: SQLite3 (Sequelize ORM)
- **Security**: Helmet, Cors
- **Validation**: Joi
- **Logging**: Winston
- **Container**: Docker, Docker Compose

## 🚀 启动指南 (How to Run)

1. **进入项目目录**:
   ```bash
   cd webtemp
   ```

2. **一键启动 (Docker)**:
   ```bash
   docker compose up --build
   ```
   *初次启动会自动构建镜像并初始化数据库文件。*

3. **访问网站**:
   打开浏览器访问: [http://localhost:3000](http://localhost:3000)

## 🏗 架构说明
- **目录结构**:
  - `src/controllers`: 业务逻辑层
  - `src/routes`: 路由定义
  - `src/middlewares`: 中间件 (日志、错误处理、验证)
  - `src/models`: 数据模型
  - `src/config`: 配置文件
- **零 Mock**: 所有数据交互均通过 Sequelize 操作真实 SQLite 数据库。
- **健壮性**: 
  - 统一错误处理 (`errorHandler`)
  - 结构化日志 (`winston`)
  - 入参严格校验 (`joi`)

## 开源协议
MIT License
