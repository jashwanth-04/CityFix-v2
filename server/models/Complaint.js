const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    photo: {
        type: String, // Path to the uploaded image
        required: false
    },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        address: { type: String }
    },
    department: {
        type: String,
        enum: ['Sanitation', 'Roads', 'Water', 'Electricity', 'Other'],
        default: 'Other'
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Resolved'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
