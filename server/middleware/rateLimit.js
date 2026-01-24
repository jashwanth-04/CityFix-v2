/**
 * Rate Limiting Middleware
 * 
 * Implements IP + user-based rate limiting following OWASP recommendations:
 * - Strict limits on auth endpoints to prevent brute force attacks
 * - Standard limits on API endpoints to prevent abuse
 * - Graceful 429 responses with Retry-After headers
 * 
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html
 */

const rateLimit = require('express-rate-limit');

/**
 * Auth-specific rate limiter - Very strict to prevent brute force attacks
 * 
 * Configuration:
 * - Window: 15 minutes
 * - Max requests: 5 per window (login/register attempts)
 * - Applies to: /api/auth/* endpoints
 * - Uses default IP-based key generation (IPv6-safe)
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Too many authentication attempts',
            message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
            retryAfter: Math.ceil((req.rateLimit?.resetTime - Date.now()) / 1000) || 900
        });
    },
    skipSuccessfulRequests: false, // Count all requests, not just failed ones
});

/**
 * API rate limiter - Standard protection for general API endpoints
 * 
 * Configuration:
 * - Window: 15 minutes
 * - Max requests: 100 per window
 * - Applies to: All /api/* endpoints (except auth which has its own limiter)
 * - Uses default IP-based key generation (IPv6-safe)
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Too many requests',
            message: 'Too many requests from this IP. Please try again later.',
            retryAfter: Math.ceil((req.rateLimit?.resetTime - Date.now()) / 1000) || 900
        });
    },
});

/**
 * Complaint creation rate limiter - Moderate limits to prevent spam
 * 
 * Configuration:
 * - Window: 1 hour
 * - Max requests: 10 complaints per hour
 * - Prevents spam submissions while allowing legitimate use
 * - Uses default IP-based key generation (IPv6-safe)
 */
const complaintLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 complaints per hour
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Too many complaints submitted',
            message: 'You have submitted too many complaints. Please try again later.',
            retryAfter: Math.ceil((req.rateLimit?.resetTime - Date.now()) / 1000) || 3600
        });
    },
});

module.exports = {
    authLimiter,
    apiLimiter,
    complaintLimiter
};
