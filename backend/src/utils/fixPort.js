/**
 * Helper script to check and update port if 5000 is blocked
 * This will help identify port conflicts on macOS
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const checkPort = async (port) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 500);
    
    const response = await fetch(`http://localhost:${port}/api/health`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
};

const fixPort = async () => {
  const envPath = path.join(__dirname, '../../.env');
  
  // Read current .env
  let envContent = '';
  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (error) {
    console.log('❌ Could not read .env file');
    return;
  }

  // Check if port 5000 is blocked
  const port5000InUse = await checkPort(5000);
  
  if (port5000InUse) {
    console.log('⚠️  Port 5000 appears to be in use (likely by macOS Control Center)');
    console.log('💡 Recommendation: Change PORT to 5001 in your .env file');
    
    // Check if PORT is already set
    if (envContent.includes('PORT=5000')) {
      console.log('\n✅ Found PORT=5000 in .env');
      console.log('   Consider changing it to PORT=5001');
    } else if (envContent.includes('PORT=')) {
      console.log('\n✅ PORT is already configured');
    } else {
      console.log('\n📝 Adding PORT=5001 to .env...');
      envContent += '\nPORT=5001\n';
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Updated .env file');
    }
  } else {
    console.log('✅ Port 5000 appears to be available');
  }
};

fixPort();

