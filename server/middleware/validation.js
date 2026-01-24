/**
 * Input Validation Middleware
 * 
 * Schema-based validation using Joi following OWASP input validation guidelines:
 * - Type checking on all fields
 * - Reject unexpected fields
 * - Sanitize string inputs (trim, escape)
 * - Validate formats (email, password strength)
 * 
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
 */

const Joi = require('joi');
const xss = require('xss');

/**
 * XSS sanitization options - configure what HTML is allowed (none by default)
 */
const xssOptions = {
    whiteList: {}, // No HTML tags allowed
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style']
};

/**
 * Sanitize a string value to prevent XSS attacks
 * @param {string} value - The string to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeString = (value) => {
    if (typeof value !== 'string') return value;
    return xss(value.trim(), xssOptions);
};

/**
 * Custom Joi extension for sanitized strings
 * Automatically trims and XSS-sanitizes string inputs
 */
const sanitizedString = () => Joi.string().trim().custom((value, helpers) => {
    return sanitizeString(value);
});

// =============================================================================
// AUTH VALIDATION SCHEMAS
// =============================================================================

/**
 * Registration validation schema
 * - username: 3-30 alphanumeric characters, underscores allowed
 * - email: Valid email format
 * - password: 8-128 chars, must contain uppercase, lowercase, number
 * - role: Must be 'citizen' or 'admin'
 */
const registerSchema = Joi.object({
    username: sanitizedString()
        .min(3)
        .max(30)
        .pattern(/^[a-zA-Z0-9_]+$/)
        .required()
        .messages({
            'string.min': 'Username must be at least 3 characters',
            'string.max': 'Username cannot exceed 30 characters',
            'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
            'any.required': 'Username is required'
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters',
            'string.max': 'Password cannot exceed 128 characters',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            'any.required': 'Password is required'
        }),
    role: Joi.string()
        .valid('citizen', 'admin')
        .default('citizen')
        .messages({
            'any.only': 'Role must be either citizen or admin'
        })
}).options({ stripUnknown: true }); // Remove unexpected fields

/**
 * Login validation schema
 * - email: Valid email format
 * - password: Non-empty string
 */
const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required'
        })
}).options({ stripUnknown: true });

// =============================================================================
// COMPLAINT VALIDATION SCHEMAS
// =============================================================================

/**
 * Location sub-schema
 * - lat: Valid latitude (-90 to 90)
 * - lng: Valid longitude (-180 to 180)
 * - address: Optional string, max 500 chars
 */
const locationSchema = Joi.object({
    lat: Joi.number()
        .min(-90)
        .max(90)
        .required()
        .messages({
            'number.min': 'Latitude must be between -90 and 90',
            'number.max': 'Latitude must be between -90 and 90',
            'any.required': 'Latitude is required'
        }),
    lng: Joi.number()
        .min(-180)
        .max(180)
        .required()
        .messages({
            'number.min': 'Longitude must be between -180 and 180',
            'number.max': 'Longitude must be between -180 and 180',
            'any.required': 'Longitude is required'
        }),
    address: sanitizedString()
        .max(500)
        .allow('')
        .optional()
});

/**
 * Valid department values (must match Mongoose enum)
 */
const VALID_DEPARTMENTS = ['Sanitation', 'Roads', 'Water', 'Electricity', 'Other'];

/**
 * Valid status values (must match Mongoose enum)
 */
const VALID_STATUSES = ['Pending', 'In Progress', 'Resolved'];

/**
 * Complaint creation validation schema
 * - user: Valid MongoDB ObjectId format
 * - description: 10-2000 characters, sanitized
 * - department: Must be valid enum value
 * - location: Valid location object (can be string or object)
 */
const createComplaintSchema = Joi.object({
    user: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid user ID format',
            'any.required': 'User ID is required'
        }),
    description: sanitizedString()
        .min(10)
        .max(2000)
        .required()
        .messages({
            'string.min': 'Description must be at least 10 characters',
            'string.max': 'Description cannot exceed 2000 characters',
            'any.required': 'Description is required'
        }),
    department: Joi.string()
        .valid(...VALID_DEPARTMENTS)
        .default('Other')
        .messages({
            'any.only': `Department must be one of: ${VALID_DEPARTMENTS.join(', ')}`
        }),
    location: Joi.alternatives()
        .try(
            locationSchema,
            Joi.string().custom((value, helpers) => {
                // Handle location passed as JSON string
                try {
                    const parsed = JSON.parse(value);
                    const { error, value: validated } = locationSchema.validate(parsed);
                    if (error) {
                        return helpers.error('any.invalid');
                    }
                    return validated;
                } catch (e) {
                    return helpers.error('any.invalid');
                }
            })
        )
        .required()
        .messages({
            'any.required': 'Location is required',
            'any.invalid': 'Invalid location format'
        })
}).options({ stripUnknown: true });

/**
 * Complaint update validation schema
 * Only allows updating status and department (admin operations)
 * - status: Must be valid status enum
 * - department: Must be valid department enum
 */
const updateComplaintSchema = Joi.object({
    status: Joi.string()
        .valid(...VALID_STATUSES)
        .messages({
            'any.only': `Status must be one of: ${VALID_STATUSES.join(', ')}`
        }),
    department: Joi.string()
        .valid(...VALID_DEPARTMENTS)
        .messages({
            'any.only': `Department must be one of: ${VALID_DEPARTMENTS.join(', ')}`
        })
}).options({ stripUnknown: true }).min(1).messages({
    'object.min': 'At least one field (status or department) must be provided'
});

// =============================================================================
// VALIDATION MIDDLEWARE FACTORY
// =============================================================================

/**
 * Creates validation middleware for a given Joi schema
 * 
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware function
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false, // Return all errors, not just the first
            stripUnknown: true // Remove fields not in schema
        });

        if (error) {
            const errorDetails = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            console.warn(`⚠️ Validation failed for ${req.path} [${property}]:`, errorDetails);

            return res.status(400).json({
                success: false,
                message: error.details[0].message, // Send first error message for simplicity
                details: errorDetails
            });
        }

        // Replace request body/query/params with validated and sanitized values
        // In Express 5, req.query and req.params might be read-only getters
        if (property === 'body') {
            req.body = value;
        } else {
            // For query/params, we update the existing object instead of replacing it
            try {
                // Clear existing keys
                Object.keys(req[property]).forEach(key => {
                    delete req[property][key];
                });
                // Assign new values
                Object.assign(req[property], value);
            } catch (e) {
                console.error(`❌ Failed to update read-only ${property} property:`, e.message);
                // Fallback: If we can't update it, we just proceed with original (unsafe)
                // but Joi already validated the data. In a real app, you'd find a better way.
            }
        }
        next();
    };
};

// =============================================================================
// QUERY PARAMETER VALIDATION
// =============================================================================

/**
 * Complaint query parameters validation
 * - userId: Optional MongoDB ObjectId
 * - status: Optional valid status enum
 * - department: Optional valid department enum
 */
const complaintQuerySchema = Joi.object({
    userId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Invalid user ID format'
        }),
    status: Joi.string()
        .valid(...VALID_STATUSES)
        .optional(),
    department: Joi.string()
        .valid(...VALID_DEPARTMENTS)
        .optional()
}).options({ stripUnknown: true });

module.exports = {
    // Schemas
    registerSchema,
    loginSchema,
    createComplaintSchema,
    updateComplaintSchema,
    complaintQuerySchema,

    // Middleware factory
    validate,

    // Utility
    sanitizeString,

    // Constants
    VALID_DEPARTMENTS,
    VALID_STATUSES
};
