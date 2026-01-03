const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
const authRoute = require('./routes/auth');
const complaintRoute = require('./routes/complaints');

app.use('/api/auth', authRoute);
app.use('/api/complaints', complaintRoute);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.get('/', (req, res) => {
    res.send('Smart City Complaint Management System API');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
