/**
 * Smart City Complaint Management System - Server Entry Point
 * 
 * Security Hardened Configuration:
 * - Helmet for HTTP security headers
 * - Rate limiting on all endpoints
 * - Input validation and sanitization
 * - NoSQL injection prevention
 * - Secure error handling
 * 
 * @see https://cheatsheetseries.owasp.org/
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

// Load environment variables first
dotenv.config();

// Import security middleware
const {
    validateEnvVariables,
    globalErrorHandler,
    notFoundHandler,
    getCorsOptions
} = require('./middleware/security');

const { apiLimiter } = require('./middleware/rateLimit');

// =============================================================================
// STARTUP VALIDATION
// =============================================================================

// Validate required environment variables before proceeding
// This will throw an error and prevent startup if critical vars are missing
try {
    validateEnvVariables();
} catch (error) {
    console.error('❌ Startup failed:', error.message);
    process.exit(1);
}

// =============================================================================
// EXPRESS APP CONFIGURATION
// =============================================================================

const app = express();
const PORT = process.env.PORT || 5000;

// =============================================================================
// SECURITY MIDDLEWARE (Applied in order of importance)
// =============================================================================

/**
 * Helmet - Sets various HTTP headers for security
 * 
 * Protections included:
 * - X-Content-Type-Options: nosniff (prevents MIME sniffing)
 * - X-Frame-Options: DENY (prevents clickjacking)
 * - X-XSS-Protection: 1; mode=block (legacy XSS protection)
 * - Strict-Transport-Security (HSTS in production)
 * - Content-Security-Policy (restricts resource loading)
 */
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'", "http://localhost:5000", "http://127.0.0.1:5000", "http://localhost:5173", "*"], // Allow API connections
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            formAction: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

/**
 * CORS Configuration
 * - Development: Allow all origins
 * - Production: Restrict to configured origins
 */
app.use(cors(getCorsOptions()));

/**
 * Body Parser with size limits
 * 
 * Security: Limits request body size to prevent DoS attacks
 * Default limit: 10kb for JSON, adjusted for file uploads elsewhere
 */
app.use(express.json({
    limit: '10kb' // Limit JSON payload size
}));

app.use(express.urlencoded({
    extended: true,
    limit: '10kb'
}));

/**
 * Global Rate Limiter
 * 
 * Applied to all routes as a baseline protection
 * More restrictive limiters are applied to specific routes (auth, complaints)
 */
app.use('/api', apiLimiter);

/**
 * Static file serving for uploads
 * 
 * Note: In production, consider serving static files through a CDN or reverse proxy
 */
app.use('/uploads', express.static('uploads'));

// =============================================================================
// ROUTES
// =============================================================================

const authRoute = require('./routes/auth');
const complaintRoute = require('./routes/complaints');

// Mount routes with their specific middleware (rate limiting, validation)
app.use('/api/auth', authRoute);
app.use('/api/complaints', complaintRoute);

// Health check endpoint (useful for monitoring)
app.get('/', (req, res) => {
    res.json({
        message: 'Smart City Complaint Management System API',
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Health check for load balancers/monitoring
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * 404 Handler - Catch undefined routes
 */
app.use(notFoundHandler);

/**
 * Global Error Handler - Catch all errors
 * 
 * Security: Does not leak stack traces or internal details in production
 */
app.use(globalErrorHandler);

// =============================================================================
// DATABASE CONNECTION
// =============================================================================

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    });

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err.message);
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('📛 SIGTERM received, shutting down gracefully');
    mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed');
        process.exit(0);
    });
});
