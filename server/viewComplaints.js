const mongoose = require('mongoose');
const Complaint = require('./models/Complaint');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

async function viewComplaints() {
    try {
        // Get all complaints with user details
        const complaints = await Complaint.find().populate('user', 'username email role').sort({ createdAt: -1 });

        console.log('\n========================================');
        console.log('COMPLAINTS DATABASE');
        console.log('Total Complaints:', complaints.length);
        console.log('========================================\n');

        if (complaints.length === 0) {
            console.log('No complaints found in the database.\n');
        } else {
            console.log(JSON.stringify(complaints, null, 2));
        }

        console.log('\n========================================');
        console.log('Database: mongodb://localhost:27017/smartcity');
        console.log('Collection: complaints');
        console.log('========================================\n');

    } catch (error) {
        console.error('Error fetching complaints:', error);
    } finally {
        await mongoose.connection.close();
    }
}

viewComplaints();
