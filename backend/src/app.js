const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { apiLimiter } = require('./middleware/rateLimit');

// Import routes
const authRoutes = require('./routes/authRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const userRoutes = require('./routes/userRoutes');
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Secure headers
app.use(helmet({
  crossOriginResourcePolicy: false // Allows hosting local file uploads easily
}));

// CORS setup
app.use(cors({
  origin: '*', // For portfolio deployments, configure strictly if needed
  credentials: true
}));

// Logger middleware
app.use(morgan('dev'));

// General rate limiter
app.use('/api/', apiLimiter);

// JSON and URL-encoded body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routing configurations
app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/user', userRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy', timestamp: new Date() });
});

// Root route redirect
app.get('/', (req, res) => {
  res.send('AI Bug Detector API is running.');
});

// Global 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Global Error boundary middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
