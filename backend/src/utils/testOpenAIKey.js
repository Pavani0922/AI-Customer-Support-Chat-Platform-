import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
const envPath = path.join(__dirname, '..', '..', '.env');
const result = dotenv.config({ path: envPath });

console.log('🔍 Testing OpenAI API Key Configuration\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Check if .env file was loaded
if (result.error) {
  console.error('❌ Error loading .env file:', result.error.message);
  console.error(`   Expected location: ${envPath}\n`);
  process.exit(1);
} else {
  console.log(`✅ .env file loaded from: ${envPath}\n`);
}

// Get environment variables
const openaiApiKey = process.env.OPENAI_API_KEY?.trim();
const azureApiKey = process.env.AZURE_OPENAI_API_KEY?.trim();
const openaiModel = process.env.OPENAI_MODEL?.trim() || 'gpt-3.5-turbo';
const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT?.trim();
const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME?.trim();

// Display environment variables (masked for security)
console.log('📋 Environment Variables Status:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`OPENAI_API_KEY:        ${openaiApiKey ? `✅ Set (${openaiApiKey.length} chars, prefix: ${openaiApiKey.substring(0, 10)}...)` : '❌ Not set'}`);
console.log(`OPENAI_MODEL:          ${process.env.OPENAI_MODEL ? `✅ ${openaiModel}` : `⚠️  Not set (will use default: ${openaiModel})`}`);
console.log(`AZURE_OPENAI_API_KEY:  ${azureApiKey ? `✅ Set (${azureApiKey.length} chars)` : '❌ Not set'}`);
console.log(`AZURE_OPENAI_ENDPOINT: ${azureEndpoint ? `✅ ${azureEndpoint}` : '❌ Not set'}`);
console.log(`AZURE_DEPLOYMENT_NAME: ${azureDeployment ? `✅ ${azureDeployment}` : '❌ Not set'}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Validate API keys
const validateKey = (key, keyName) => {
  if (!key || key.length === 0) {
    return { valid: false, reason: 'Key is empty or not set' };
  }
  
  if (key.includes('your-') || key.includes('placeholder') || key.includes('example')) {
    return { valid: false, reason: 'Key contains placeholder text' };
  }
  
  if (keyName === 'OPENAI_API_KEY' && !key.startsWith('sk-')) {
    return { valid: false, reason: 'OpenAI API key should start with "sk-"' };
  }
  
  if (key.length < 10) {
    return { valid: false, reason: 'Key is too short (likely invalid)' };
  }
  
  return { valid: true, reason: 'Key format looks valid' };
};

const openaiValidation = validateKey(openaiApiKey, 'OPENAI_API_KEY');
const azureValidation = validateKey(azureApiKey, 'AZURE_OPENAI_API_KEY');

console.log('🔐 Key Validation:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`OPENAI_API_KEY:  ${openaiValidation.valid ? '✅' : '❌'} ${openaiValidation.reason}`);
console.log(`AZURE_API_KEY:    ${azureValidation.valid ? '✅' : '❌'} ${azureValidation.reason}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Determine which configuration will be used
let client;
let configType;
let model;

if (openaiValidation.valid) {
  configType = 'Standard OpenAI API';
  client = new OpenAI({
    apiKey: openaiApiKey
  });
  model = openaiModel;
  console.log('✅ Configuration: Using Standard OpenAI API\n');
} else if (azureValidation.valid && azureEndpoint && azureDeployment) {
  configType = 'Azure OpenAI';
  const endpoint = azureEndpoint.replace(/\/$/, '');
  client = new OpenAI({
    apiKey: azureApiKey,
    baseURL: `${endpoint}/openai/deployments/${azureDeployment}`,
    defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' },
    defaultHeaders: {
      'api-key': azureApiKey
    }
  });
  model = azureDeployment;
  console.log('⚠️  Configuration: Using Azure OpenAI (fallback)\n');
} else {
  console.error('❌ ERROR: No valid API key configuration found!\n');
  console.error('Please set one of the following in your .env file:');
  console.error('  1. OPENAI_API_KEY=sk-your-key-here (recommended)');
  console.error('  2. AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, and AZURE_OPENAI_DEPLOYMENT_NAME\n');
  process.exit(1);
}

// Test the API connection
console.log('🧪 Testing API Connection...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function testConnection() {
  try {
    console.log(`Testing with model: ${model}`);
    console.log('Sending test request...\n');
    
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Respond briefly.'
        },
        {
          role: 'user',
          content: 'Say "API connection successful" and nothing else.'
        }
      ],
      max_tokens: 20,
      temperature: 0
    });

    const message = response.choices[0].message.content;
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ API Connection Test: SUCCESS!\n');
    console.log(`Response: "${message}"\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ Your OpenAI API key is valid and working!');
    console.log(`✅ Using: ${configType}`);
    console.log(`✅ Model: ${model}\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ API Connection Test: FAILED!\n');
    console.error('Error Details:');
    console.error(`   Type: ${error.constructor.name}`);
    console.error(`   Message: ${error.message}\n`);
    
    if (error.status === 401 || error.message?.includes('Unauthorized') || error.message?.includes('401')) {
      console.error('💡 Issue: Authentication Failed');
      console.error('   Your API key is invalid or has been revoked.');
      console.error('   Please check your API key in the .env file.\n');
    } else if (error.message?.includes('ENOTFOUND') || error.message?.includes('Connection')) {
      console.error('💡 Issue: Connection Failed');
      console.error('   Could not reach OpenAI servers.');
      console.error('   Please check your internet connection.\n');
    } else if (error.status === 404 || error.message?.includes('404')) {
      console.error('💡 Issue: Model Not Found');
      console.error('   The specified model does not exist or is not available.');
      if (configType === 'Azure OpenAI') {
        console.error('   Please check AZURE_OPENAI_DEPLOYMENT_NAME in your .env file.\n');
      } else {
        console.error('   Please check OPENAI_MODEL in your .env file.\n');
      }
    } else if (error.status === 429 || error.message?.includes('429')) {
      console.error('💡 Issue: Rate Limit Exceeded');
      console.error('   Too many requests. Please wait a moment and try again.\n');
    } else {
      console.error('💡 Please check the error details above and verify your configuration.\n');
    }
    
    if (error.cause) {
      console.error('Underlying Error:', error.cause);
    }
    
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(1);
  }
}

testConnection();

