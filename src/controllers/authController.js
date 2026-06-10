const crypto = require('crypto');
const md5 = require('md5');
const { Op } = require('sequelize');
const User = require('../models/User');
const logger = require('../config/logger');

const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

function hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
}

function generateSalt() {
    return crypto.randomBytes(32).toString('hex');
}

exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
             const error = new Error('所有字段都是必填项');
             error.status = 400;
             throw error;
        }

        const salt = generateSalt();
        const hashedPassword = hashPassword(password, salt);

        await User.create({
            username,
            email,
            password: hashedPassword,
            salt
        });

        logger.info(`New user registered: ${username}`);
        res.status(201).json({ success: true, message: '注册成功' });
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            const error = new Error('用户名或邮箱已存在');
            error.status = 409;
            return next(error);
        }
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
             const error = new Error('用户名和密码不能为空');
             error.status = 400;
             throw error;
        }

        const user = await User.findOne({
            where: {
                [Op.or]: [{ username }, { email: username }]
            }
        });

        if (!user) {
             const error = new Error('用户名或密码错误');
             error.status = 401;
             throw error;
        }

        const hashedPassword = hashPassword(password, user.salt);
        const passwordMatch = crypto.timingSafeEqual(
            Buffer.from(hashedPassword, 'hex'),
            Buffer.from(user.password, 'hex')
        );

        if (!passwordMatch) {
             const error = new Error('用户名或密码错误');
             error.status = 401;
             throw error;
        }
        
        const token = md5(user.username + Date.now());
        
        logger.info(`User logged in: ${user.username}`);
        res.json({ success: true, message: '登录成功', user: { username: user.username, email: user.email }, token: token });

    } catch (err) {
        next(err);
    }
};
