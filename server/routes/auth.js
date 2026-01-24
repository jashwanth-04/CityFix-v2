/**
 * Authentication Routes
 * 
 * Security Measures:
 * - Strict rate limiting (5 requests per 15 minutes per IP)
 * - Schema-based input validation
 * - Password hashing with bcrypt (cost factor 10)
 * - JWT token generation with expiration
 * - Safe error responses (no stack traces leaked)
 * 
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
 */

const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Security middleware
const { authLimiter } = require('../middleware/rateLimit');
const {
    validate,
    registerSchema,
    loginSchema
} = require('../middleware/validation');
const { asyncHandler } = require('../middleware/security');

// =============================================================================
// Apply rate limiting to all auth routes
// Protects against brute force attacks
// =============================================================================
router.use(authLimiter);

// =============================================================================
// REGISTER ENDPOINT
// =============================================================================

/**
 * POST /api/auth/register
 * 
 * Creates a new user account
 * 
 * Security:
 * - Rate limited: 5 attempts per 15 minutes
 * - Input validated: username, email, password, role
 * - Password hashed before storage
 * - Unexpected fields stripped from request
 * 
 * @body {string} username - 3-30 chars, alphanumeric + underscore
 * @body {string} email - Valid email format
 * @body {string} password - 8+ chars, must contain upper, lower, number
 * @body {string} [role=citizen] - 'citizen' or 'admin'
 * 
 * @returns {Object} Created user (without password)
 */
router.post('/register',
    validate(registerSchema), // Validate and sanitize input
    asyncHandler(async (req, res) => {
        const { username, email, password, role } = req.body;

        // Check if user already exists
        // Note: Using findOne instead of exists for consistent error messaging
        const existingUser = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { username }]
        });

        if (existingUser) {
            // OWASP: Don't reveal which field caused the conflict
            return res.status(400).json({
                success: false,
                message: 'An account with this email or username already exists'
            });
        }

        // Hash password with bcrypt
        // Cost factor 10 provides good security/performance balance
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            username,
            email: email.toLowerCase(), // Normalize email to lowercase
            password: hashedPassword,
            role: role || 'citizen'
        });

        const savedUser = await newUser.save();

        // Return user without password
        const userResponse = {
            id: savedUser._id,
            username: savedUser.username,
            email: savedUser.email,
            role: savedUser.role,
            createdAt: savedUser.createdAt
        };

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            user: userResponse
        });
    })
);

// =============================================================================
// LOGIN ENDPOINT
// =============================================================================

/**
 * POST /api/auth/login
 * 
 * Authenticates user and returns JWT token
 * 
 * Security:
 * - Rate limited: 5 attempts per 15 minutes
 * - Input validated: email, password
 * - Timing-safe password comparison
 * - Generic error messages (prevent user enumeration)
 * - Token expires in 1 day
 * 
 * @body {string} email - User's email address
 * @body {string} password - User's password
 * 
 * @returns {Object} JWT token and user info
 */
router.post('/login',
    validate(loginSchema), // Validate and sanitize input
    asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        // Find user by email (case-insensitive)
        const user = await User.findOne({ email: email.toLowerCase() });

        // OWASP: Use generic message to prevent user enumeration
        // Don't reveal whether email exists or password is wrong
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Validate password using bcrypt's timing-safe comparison
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        // OWASP: Include minimal claims, use short expiration
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d',
                algorithm: 'HS256'
            }
        );

        // Return token and user info (without password)
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    })
);

module.exports = router;
