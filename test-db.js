require('dotenv').config();
const mongoose = require('mongoose');
const Application = require('./models/Application');

async function testDatabase() {
  try {
    console.log('Connecting to database...');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('✅ Connected to database');

    // Test creating an application
    console.log('Creating test application...');

    const testApp = new Application({
      name: 'Test User',
      email: 'test@example.com',
      level: 'beginner',
      goals: 'Learn algorithms'
    });

    console.log('Saving application...');
    const savedApp = await testApp.save();
    console.log('✅ Application saved successfully:', savedApp._id);

    // Clean up
    await Application.findByIdAndDelete(savedApp._id);
    console.log('✅ Test application cleaned up');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('❌ Error details:', error);
    process.exit(1);
  }
}

testDatabase();
