/**
 * Complaint Routes
 * 
 * Security Measures:
 * - Rate limiting (100 requests per 15 min, 10 complaints per hour)
 * - Schema-based input validation
 * - Query parameter sanitization
 * - Safe error responses
 * - File upload restrictions (images only, 5MB limit)
 * 
 * @see https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
 */

const router = require('express').Router();
const Complaint = require('../models/Complaint');
const upload = require('../middleware/upload');

// Security middleware
const { apiLimiter, complaintLimiter } = require('../middleware/rateLimit');
const {
    validate,
    createComplaintSchema,
    updateComplaintSchema,
    complaintQuerySchema
} = require('../middleware/validation');
const { asyncHandler } = require('../middleware/security');

// =============================================================================
// CREATE COMPLAINT
// =============================================================================

/**
 * POST /api/complaints
 * 
 * Creates a new complaint with optional photo upload
 * 
 * Security:
 * - Rate limited: 10 complaints per hour per user
 * - Input validated: description, department, location
 * - File upload restricted: images only, 5MB max
 * - Unexpected fields stripped from request
 * 
 * @body {string} user - MongoDB ObjectId of the user
 * @body {string} description - 10-2000 chars, sanitized
 * @body {string} department - One of: Sanitation, Roads, Water, Electricity, Other
 * @body {Object|string} location - {lat, lng, address} or JSON string
 * @file {File} [photo] - Optional image file (jpeg, jpg, png, gif)
 * 
 * @returns {Object} Created complaint
 */
router.post('/',
    complaintLimiter, // Stricter rate limit for creating complaints
    upload.single('photo'), // Handle file upload first
    asyncHandler(async (req, res, next) => {
        // Parse location if sent as JSON string (from FormData)
        if (typeof req.body.location === 'string') {
            try {
                req.body.location = JSON.parse(req.body.location);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    message: 'Invalid location format. Expected JSON object.'
                });
            }
        }
        next();
    }),
    validate(createComplaintSchema), // Validate after parsing location
    asyncHandler(async (req, res) => {
        const { user, description, location, department } = req.body;

        const newComplaint = new Complaint({
            user,
            description,
            location,
            department,
            photo: req.file ? req.file.path : null
        });

        const savedComplaint = await newComplaint.save();

        res.status(201).json({
            success: true,
            message: 'Complaint submitted successfully',
            complaint: savedComplaint
        });
    })
);

// =============================================================================
// GET ALL COMPLAINTS
// =============================================================================

/**
 * GET /api/complaints
 * 
 * Retrieves complaints with optional filtering
 * 
 * Security:
 * - Rate limited: 100 requests per 15 minutes
 * - Query parameters validated and sanitized
 * - Only valid MongoDB ObjectIds accepted for userId
 * 
 * @query {string} [userId] - Filter by user ObjectId
 * @query {string} [status] - Filter by status: Pending, In Progress, Resolved
 * @query {string} [department] - Filter by department
 * 
 * @returns {Array} List of complaints matching filters
 */
router.get('/',
    apiLimiter,
    validate(complaintQuerySchema, 'query'), // Validate query params
    asyncHandler(async (req, res) => {
        const { userId, status, department } = req.query;

        // Build query object from validated params
        const query = {};
        if (userId) query.user = userId;
        if (status) query.status = status;
        if (department) query.department = department;

        const complaints = await Complaint.find(query)
            .populate('user', 'username email') // Only return safe user fields
            .sort({ createdAt: -1 }); // Newest first

        // Return array directly to match frontend expectations
        res.status(200).json(complaints);
    })
);

// =============================================================================
// UPDATE COMPLAINT
// =============================================================================

/**
 * PUT /api/complaints/:id
 * 
 * Updates a complaint (typically status updates by admin)
 * 
 * Security:
 * - Rate limited: 100 requests per 15 minutes
 * - Only status and department fields can be updated
 * - Input validated against allowed enum values
 * - Unexpected fields stripped from request
 * 
 * @param {string} id - Complaint MongoDB ObjectId
 * @body {string} [status] - New status: Pending, In Progress, Resolved
 * @body {string} [department] - New department assignment
 * 
 * @returns {Object} Updated complaint
 */
router.put('/:id',
    apiLimiter,
    validate(updateComplaintSchema), // Only allow status/department updates
    asyncHandler(async (req, res) => {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID',
                message: 'The complaint ID format is invalid'
            });
        }

        // req.body is already sanitized by validation middleware
        // Only contains allowed fields (status, department)
        const updatedComplaint = await Complaint.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updatedComplaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Return object directly to match frontend expectations
        res.status(200).json(updatedComplaint);
    })
);

// =============================================================================
// GET SINGLE COMPLAINT
// =============================================================================

/**
 * GET /api/complaints/:id
 * 
 * Retrieves a single complaint by ID
 * 
 * Security:
 * - Rate limited: 100 requests per 15 minutes
 * - ObjectId format validated
 * 
 * @param {string} id - Complaint MongoDB ObjectId
 * 
 * @returns {Object} Complaint details
 */
router.get('/:id',
    apiLimiter,
    asyncHandler(async (req, res) => {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID',
                message: 'The complaint ID format is invalid'
            });
        }

        const complaint = await Complaint.findById(id)
            .populate('user', 'username email');

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Return object directly to match frontend expectations
        res.status(200).json(complaint);
    })
);

module.exports = router;
