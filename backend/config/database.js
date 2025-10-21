const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  // Try local or provided MongoDB URI first
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/investing101';

  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  try {
    await mongoose.connect(mongoURI, options);
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);

  } catch (error) {
    console.warn('⚠️ MongoDB connection failed:', error.message);
    console.warn('💡 Falling back to in-memory MongoDB (mongodb-memory-server)');
    
    // Start in-memory MongoDB server
    mongoMemoryServer = await MongoMemoryServer.create();
    mongoMemoryServer.keepAlive = true;
    const mongoUri = mongoMemoryServer.getUri();
    
    try {
      await mongoose.connect(mongoUri, options);
      console.log('🔁 Connected to in-memory MongoDB');
      console.log(`📊 Database: ${mongoose.connection.name}`);
      console.log(`🌐 Host: ${mongoose.connection.host}`);
    } catch (memError) {
      console.error('❌ In-memory MongoDB connection failed:', memError.message);
      console.warn('🚨 Server will run without database connectivity');
    }
  }

  // Event listeners for connection status
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected');
  });
};

module.exports = connectDB;
