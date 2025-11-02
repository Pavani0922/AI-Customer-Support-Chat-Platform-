import dotenv from 'dotenv';

dotenv.config();

/**
 * Test Authentication Endpoints
 * Tests login and register functionality
 */

// Try to find the server port - check common ports
const tryPorts = [5000, 5001, 3000, 8000];
let API_URL = null;

// Try to find which port the server is running on
const findServerPort = async () => {
  for (const port of tryPorts) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);
      
      const response = await fetch(`http://localhost:${port}/api/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return `http://localhost:${port}/api`;
      }
    } catch (error) {
      // Port not available, try next
      continue;
    }
  }
  return null;
};

// Test Login
const testLogin = async (username, password) => {
  try {
    console.log(`\n🔐 Testing login with username: ${username}`);
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok && response.status !== 401) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log(`   Token: ${data.token.substring(0, 50)}...`);
      console.log(`   User: ${data.user.username} (${data.user.role})`);
      return data.token;
    } else {
      console.log(`❌ Login failed: ${data.message || 'Unknown error'}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error during login test:`, error.message);
    return null;
  }
};

// Test Register
const testRegister = async (username, password, role = 'user') => {
  try {
    console.log(`\n📝 Testing registration for username: ${username}`);
    
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, role }),
    });

    if (!response.ok && response.status !== 400) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful!');
      console.log(`   Token: ${data.token.substring(0, 50)}...`);
      console.log(`   User: ${data.user.username} (${data.user.role})`);
      return data.token;
    } else {
      console.log(`❌ Registration failed: ${data.message || 'Unknown error'}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error during registration test:`, error.message);
    return null;
  }
};

// Run tests
const runTests = async () => {
  console.log('🧪 Testing Authentication Endpoints\n');
  console.log('='.repeat(50));

  // Test 1: Login with admin user
  await testLogin('admin', 'admin123');

  // Test 2: Register a new regular user
  await testRegister('testuser', 'testpass123', 'user');

  // Test 3: Login with the new user
  await testLogin('testuser', 'testpass123');

  // Test 4: Test invalid credentials
  console.log(`\n🔒 Testing invalid credentials...`);
  await testLogin('admin', 'wrongpassword');

  // Test 5: Test duplicate registration
  console.log(`\n🔄 Testing duplicate registration...`);
  await testRegister('testuser', 'testpass123', 'user');

  console.log('\n' + '='.repeat(50));
  console.log('✅ Authentication tests completed!\n');
};

// Initialize and run tests
const init = async () => {
  const detectedPort = await findServerPort();
  if (!detectedPort) {
    console.error('❌ Could not find running server on ports:', tryPorts.join(', '));
    console.error('Please make sure the backend server is running!');
    process.exit(1);
  }
  
  API_URL = detectedPort;
  console.log(`✅ Found server at: ${API_URL.replace('/api', '')}\n`);
  
  await runTests();
};

init().catch(console.error);

