const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    // 加盐哈希后的口令（pbkdf2-sha512 hex）
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // 每用户独立的随机盐（hex）
    salt: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = User;
