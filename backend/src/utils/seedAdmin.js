import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

/**
 * Script to seed an admin user
 * Run with: node src/utils/seedAdmin.js
 */
const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const admin = new User({
      username: 'admin',
      password: adminPassword, // Let the pre-save hook hash it
      role: 'admin'
    });

    await admin.save();
    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log(`Password: ${adminPassword}`);
    console.log('\n⚠️  Please change the default password after first login!');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedAdmin();

