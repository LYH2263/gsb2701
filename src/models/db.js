const { Sequelize } = require('sequelize');
const path = require('path');

// 统一指向项目根目录下的 database.sqlite，
// 与 docker-compose.yml 中的 DB_PATH=/app/database.sqlite（来自宿主根目录的同一个文件）保持一致
const storagePath = process.env.DB_PATH || path.join(__dirname, '../../database.sqlite');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false // Disable logging for cleaner output
});

module.exports = sequelize;
