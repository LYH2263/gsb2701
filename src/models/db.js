const { Sequelize } = require('sequelize');
const path = require('path');

// Use environment variable for DB path or default to local file
const storagePath = process.env.DB_PATH || path.join(__dirname, '../../database.sqlite');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false // Disable logging for cleaner output
});

module.exports = sequelize;
