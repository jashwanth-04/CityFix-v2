const router = require('express').Router();
const Complaint = require('../models/Complaint');
const upload = require('../middleware/upload');

// Create a complaint
router.post('/', upload.single('photo'), async (req, res) => {
    try {
        const { user, description, location, department } = req.body;

        // Parse location if it's sent as a string
        let parsedLocation = location;
        if (typeof location === 'string') {
            try {
                parsedLocation = JSON.parse(location);
            } catch (e) {
                // handle error or keep as is
            }
        }

        const newComplaint = new Complaint({
            user,
            description,
            location: parsedLocation,
            department,
            photo: req.file ? req.file.path : null
        });

        const savedComplaint = await newComplaint.save();
        res.status(201).json(savedComplaint);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get all complaints
router.get('/', async (req, res) => {
    try {
        const { userId, status, department } = req.query;
        let query = {};
        if (userId) query.user = userId;
        if (status) query.status = status;
        if (department) query.department = department;

        const complaints = await Complaint.find(query).populate('user', 'username email');
        res.status(200).json(complaints);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Update complaint
router.put('/:id', async (req, res) => {
    try {
        const updatedComplaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedComplaint);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
