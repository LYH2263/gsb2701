const crypto = require('crypto');
const { Op } = require('sequelize');
const User = require('../models/User');
const logger = require('../config/logger');

const ITERATIONS = 10000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

function generateSalt() {
    return crypto.randomBytes(16).toString('hex');
}

function hashPassword(password, salt) {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
            if (err) return reject(err);
            resolve(derivedKey.toString('hex'));
        });
    });
}

async function verifyPassword(password, salt, hashedPassword) {
    const inputHash = await hashPassword(password, salt);
    return crypto.timingSafeEqual(Buffer.from(inputHash, 'hex'), Buffer.from(hashedPassword, 'hex'));
}

function generateToken(username) {
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
        const hashedPassword = await hashPassword(password, salt);

        await User.create({
            username,
            email,
            password: hashedPassword,
            salt: salt
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

        const isPasswordValid = await verifyPassword(password, user.salt, user.password);
        
        if (!isPasswordValid) {
             const error = new Error('用户名或密码错误');
             error.status = 401;
             throw error;
        }
        
        const token = generateToken(user.username);
        
        logger.info(`User logged in: ${user.username}`);
        res.json({ success: true, message: '登录成功', user: { username: user.username, email: user.email }, token: token });

    } catch (err) {
        next(err);
    }
};
