const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const sequelize = require('./models/db');
const logger = require('./config/logger');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Security Middlewares
app.use(helmet({
    contentSecurityPolicy: false, // Disable for simple static site compatibility (inline scripts)
}));
app.use(cors());

// Parsing Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request Logger (Simple middleware using Winston)
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// Static Files
app.use(express.static(path.join(__dirname, '../public')));

// Database Sync
sequelize.sync({ alter: true }).then(() => {
    logger.info('Database synced successfully.');
}).catch(err => {
    logger.error('Error syncing database:', err);
});

// Routes
app.use('/api/auth', authRoutes);

// 404 Handler for API
app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, message: 'API Endpoint Not Found' });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
