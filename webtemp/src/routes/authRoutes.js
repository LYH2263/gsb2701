const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validateRequest = require('../middlewares/validateRequest');
const Joi = require('joi');

const registerSchema = Joi.object({
    username: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    // Allow extra fields if frontend sends them, or strip them
}).unknown(true);

const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
});

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);

module.exports = router;
