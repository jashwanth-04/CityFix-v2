/**
 * Security Middleware
 * 
 * Additional security utilities following OWASP guidelines:
 * - Environment variable validation at startup
 * - Safe error handler that doesn't leak stack traces
 * - Security configuration helpers
 * 
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html
 */

/**
 * Required environment variables for secure operation
 * Application will fail to start if these are missing
 */
const REQUIRED_ENV_VARS = [
    'MONGO_URI',
    'JWT_SECRET'
];

/**
 * Validate that all required environment variables are set
 * Call this during application startup before connecting to services
 * 
 * @throws {Error} If any required environment variable is missing
 */
const validateEnvVariables = () => {
    const missing = [];
    const warnings = [];

    for (const varName of REQUIRED_ENV_VARS) {
        if (!process.env[varName]) {
            missing.push(varName);
        }
    }

    // Check JWT_SECRET strength
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
        warnings.push('JWT_SECRET should be at least 32 characters for security');
    }

    // Check for production environment
    if (process.env.NODE_ENV === 'production') {
        if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_jwt_secret_key') {
            missing.push('JWT_SECRET (must be set to a secure value in production)');
        }
    }

    // Log warnings
    warnings.forEach(warning => {
        console.warn(`⚠️  Security Warning: ${warning}`);
    });

    // Throw error if required vars are missing
    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}\n` +
            'Please check your .env file or environment configuration.'
        );
    }

    console.log('✅ Environment variables validated successfully');
};

/**
 * Global error handler middleware
 * Prevents leaking stack traces and internal error details to clients
 * 
 * OWASP: Error messages should be generic and not reveal implementation details
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object  
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const globalErrorHandler = (err, req, res, next) => {
    // Log full error for debugging (server-side only)
    console.error('❌ Error caught by global handler:', {
        message: err.message,
        name: err.name,
        code: err.code,
        path: req.path,
        method: req.method,
        body: req.body,
        timestamp: new Date().toISOString()
    });

    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    // Determine error type and appropriate response
    let statusCode = err.statusCode || err.status || 500;
    let message = err.message || 'An unexpected error occurred';

    // Handle Joi validation errors specifically
    if (err.isJoi) {
        statusCode = 400;
        message = err.details.map(d => d.message).join(', ');
    } else if (err.name === 'ValidationError') {
        // Mongoose validation error
        statusCode = 400;
        message = 'Validation failed';
    } else if (err.name === 'CastError') {
        // Invalid MongoDB ObjectId
        statusCode = 400;
        message = 'Invalid ID format';
    } else if (err.code === 11000) {
        // MongoDB duplicate key error
        statusCode = 409;
        message = 'Duplicate entry. This resource already exists.';
    } else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token has expired';
    } else if (statusCode === 500) {
        // Generic server error - hide details in production
        message = process.env.NODE_ENV === 'development'
            ? err.message
            : 'An internal server error occurred';
    }

    res.status(statusCode).json({
        success: false,
        message: message, // Client expects 'message'
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
        // Only include stack trace in development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/**
 * 404 Not Found handler
 * Returns consistent JSON response for unknown routes
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `The requested resource '${req.originalUrl}' was not found`
    });
};

/**
 * Async error wrapper
 * Wraps async route handlers to properly catch and forward errors
 * 
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function that catches errors
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * CORS configuration for production
 * Restricts origins in production while allowing all in development
 */
const getCorsOptions = () => {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
        origin: isProduction
            ? process.env.ALLOWED_ORIGINS?.split(',') || 'https://yourdomain.com'
            : true, // Allow all origins in development
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
        maxAge: 86400 // 24 hours
    };
};

module.exports = {
    validateEnvVariables,
    globalErrorHandler,
    notFoundHandler,
    asyncHandler,
    getCorsOptions,
    REQUIRED_ENV_VARS
};
