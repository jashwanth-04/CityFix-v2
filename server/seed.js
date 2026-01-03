const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing users (optional - comment out if you want to keep existing users)
        // await User.deleteMany({});

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // Create dummy users
        const users = [
            {
                username: 'john_citizen',
                email: 'citizen@test.com',
                password: hashedPassword,
                role: 'citizen'
            },
            {
                username: 'admin_user',
                email: 'admin@test.com',
                password: hashedPassword,
                role: 'admin'
            },
            {
                username: 'jane_doe',
                email: 'jane@test.com',
                password: hashedPassword,
                role: 'citizen'
            }
        ];

        // Insert users
        await User.insertMany(users);
        console.log('✅ Dummy users created successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('\n👤 CITIZEN ACCOUNT:');
        console.log('   Email: citizen@test.com');
        console.log('   Password: password123');
        console.log('\n👤 ADMIN ACCOUNT:');
        console.log('   Email: admin@test.com');
        console.log('   Password: password123');
        console.log('\n👤 ADDITIONAL CITIZEN:');
        console.log('   Email: jane@test.com');
        console.log('   Password: password123');

        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedUsers();
