import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Test MongoDB Atlas Connection
 * This script tests the connection to MongoDB Atlas using the connection string
 * from the .env file and provides detailed feedback.
 */

const testMongoConnection = async () => {
  console.log('🔍 Testing MongoDB Atlas Connection...\n');

  // Check if MongoDB URI is set
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ Error: MONGODB_URI is not set in .env file');
    console.log('Please add MONGODB_URI=your-connection-string to your .env file');
    process.exit(1);
  }

  // Mask the connection string for security (show only first and last parts)
  const maskedUri = mongoUri.length > 50 
    ? `${mongoUri.substring(0, 20)}...${mongoUri.substring(mongoUri.length - 20)}`
    : '***';

  console.log(`📍 Connection String: ${maskedUri}`);
  console.log(`📝 Database Name: ${mongoUri.split('/').pop()?.split('?')[0] || 'N/A'}\n`);

  try {
    console.log('⏳ Attempting to connect to MongoDB Atlas...\n');

    // Set connection options
    const options = {
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4, skip trying IPv6
    };

    // Attempt connection
    const conn = await mongoose.connect(mongoUri, options);

    console.log('✅ MongoDB Atlas Connection Successful!\n');
    console.log('📊 Connection Details:');
    console.log(`   - Host: ${conn.connection.host}`);
    console.log(`   - Port: ${conn.connection.port}`);
    console.log(`   - Database: ${conn.connection.name}`);
    console.log(`   - Ready State: ${getReadyState(conn.connection.readyState)}`);
    
    // Test database operation
    console.log('\n🧪 Testing database operation...');
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`   - Collections found: ${collections.length}`);
    if (collections.length > 0) {
      console.log(`   - Collection names: ${collections.map(c => c.name).join(', ')}`);
    }

    // Test a simple operation
    const testCollection = conn.connection.db.collection('_connection_test');
    await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date() 
    });
    await testCollection.deleteOne({ test: true });
    console.log('   ✅ Read/Write test successful\n');

    console.log('🎉 All tests passed! MongoDB Atlas connection is working correctly.\n');

    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ MongoDB Atlas Connection Failed!\n');
    console.error('Error Details:');
    console.error(`   - Error Name: ${error.name}`);
    console.error(`   - Error Message: ${error.message}\n`);

    // Provide helpful error messages
    if (error.message.includes('authentication failed')) {
      console.error('💡 Suggestion: Check your MongoDB Atlas username and password in the connection string.');
    } else if (error.message.includes('bad auth')) {
      console.error('💡 Suggestion: Verify your MongoDB Atlas credentials are correct.');
    } else if (error.message.includes('timeout')) {
      console.error('💡 Suggestion: Check your network connection and MongoDB Atlas IP whitelist settings.');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('💡 Suggestion: Check if the MongoDB Atlas cluster hostname is correct.');
    } else if (error.message.includes('MongoServerError')) {
      console.error('💡 Suggestion: Verify your MongoDB Atlas cluster is running and accessible.');
    } else {
      console.error('💡 Suggestion: Double-check your MONGODB_URI connection string format.');
      console.error('   Expected format: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority');
    }

    console.error('\n📚 Common MongoDB Atlas Connection String Format:');
    console.error('   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority\n');

    process.exit(1);
  }
};

/**
 * Convert MongoDB ready state code to readable string
 */
const getReadyState = (state) => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized'
  };
  return states[state] || 'unknown';
};

// Run the test
testMongoConnection();

