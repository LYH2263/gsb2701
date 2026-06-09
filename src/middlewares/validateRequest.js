const logger = require('../config/logger');

const validateRequest = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        logger.warn(`Validation Error: ${error.details[0].message}`);
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    next();
};

module.exports = validateRequest;
