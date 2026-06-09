const md5 = require('md5');
const User = require('../models/User');
const logger = require('../config/logger');

exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        
        // Input validation is handled by Joi middleware, double check here not needed if middleware is used.
        // But for safety:
        if (!username || !email || !password) {
             const error = new Error('所有字段都是必填项');
             error.status = 400;
             throw error;
        }

        const hashedPassword = md5(password);

        await User.create({
            username,
            email,
            password: hashedPassword
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

        const hashedPassword = md5(password);

        const user = await User.findOne({
            where: {
                [require('sequelize').Op.or]: [{ username }, { email: username }],
                password: hashedPassword
            }
        });

        if (!user) {
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
