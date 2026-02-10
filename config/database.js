const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connection established');
    });

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.error('Full error:', error);
    
    // Provide helpful error messages for Atlas
    if (error.name === 'MongoServerSelectionError') {
      console.error('\n💡 Tip: Check your MongoDB Atlas connection string and network access');
      console.error('   1. Make sure your IP is whitelisted in Atlas Network Access');
      console.error('   2. Verify your username and password in the connection string');
      console.error('   3. Check if the cluster is paused in Atlas');
    } else if (error.name === 'MongoParseError') {
      console.error('\n💡 Tip: Check your connection string format');
      console.error('   Should be: mongodb+srv://username:password@cluster.mongodb.net/dbname');
    }
    
    // Don't exit in development, just log error
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return null;
  }
};

module.exports = connectDB;