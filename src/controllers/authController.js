const crypto = require('crypto');
const { Op } = require('sequelize');
const User = require('../models/User');
const logger = require('../config/logger');

// 使用 Node 内置 crypto（pbkdf2 + sha512），每用户独立随机盐
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = 'sha512';

const generateSalt = () => crypto.randomBytes(16).toString('hex');

const hashPassword = (password, salt) =>
    crypto
        .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
        .toString('hex');

// 恒定时间比较，避免计时侧信道
const safeEqual = (a, b) => {
    const ba = Buffer.from(a, 'hex');
    const bb = Buffer.from(b, 'hex');
    if (ba.length !== bb.length) return false;
    return crypto.timingSafeEqual(ba, bb);
};

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

        // 仅按用户名/邮箱查找，再用各自的盐校验口令
        const user = await User.findOne({
            where: {
                [Op.or]: [{ username }, { email: username }]
            }
        });

        if (!user || !user.salt) {
            const error = new Error('用户名或密码错误');
            error.status = 401;
            throw error;
        }

        const candidate = hashPassword(password, user.salt);
        if (!safeEqual(candidate, user.password)) {
            const error = new Error('用户名或密码错误');
            error.status = 401;
            throw error;
        }

        const token = crypto
            .createHash('sha256')
            .update(user.username + Date.now() + crypto.randomBytes(8).toString('hex'))
            .digest('hex');

        logger.info(`User logged in: ${user.username}`);
        res.json({
            success: true,
            message: '登录成功',
            user: { username: user.username, email: user.email },
            token
        });
    } catch (err) {
        next(err);
    }
};
