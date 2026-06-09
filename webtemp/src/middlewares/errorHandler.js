const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

    const statusCode = err.status || 500;
    const message = err.message || '服务器内部错误';

    res.status(statusCode).json({
        success: false,
        message: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = errorHandler;
