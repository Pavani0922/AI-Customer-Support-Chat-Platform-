# Azure OpenAI Setup Guide

This guide will help you set up Azure OpenAI and get the required API keys for free.

## 📋 Prerequisites

- A Microsoft account (or create one at [signup.live.com](https://signup.live.com))
- Valid credit card (required for verification, but you won't be charged for free tier)

## 🚀 Step-by-Step Setup

### 1. Create Azure Account

1. Go to [azure.microsoft.com/free](https://azure.microsoft.com/free)
2. Click "Start free" and sign up with your Microsoft account
3. Complete the verification process (requires credit card)
4. **You'll receive $200 in free credits valid for 30 days**

### 2. Request Azure OpenAI Access

1. Login to [Azure Portal](https://portal.azure.com)
2. Search for "Azure OpenAI" in the top search bar
3. Click on "Azure OpenAI" service
4. Click "Create" to request access
5. Fill out the application form:
   - **Subscription**: Select your free trial subscription
   - **Resource Group**: Create a new one (e.g., "my-openai-resources")
   - **Region**: Choose closest to you (e.g., "East US", "West Europe")
   - **Name**: Choose a unique name (e.g., "my-customer-support-ai")
   - **Pricing Tier**: Choose "S0" (Standard)
6. Click "Review + Create" then "Create"
7. **Note**: Access approval may take 1-3 business days

### 3. Deploy Models

Once your resource is created:

#### Deploy Chat Model (Required)

1. In Azure Portal, go to your Azure OpenAI resource
2. Click on "Model deployments" in the left sidebar
3. Click "Create" to add a new deployment
4. Configure:
   - **Model**: Select "gpt-35-turbo" (or "gpt-4" if available)
   - **Model version**: Auto
   - **Deployment name**: `gpt-35-turbo` (use this exact name)
5. Click "Create" and wait for deployment

#### Deploy Embedding Model (Optional but Recommended)

1. In the same "Model deployments" section
2. Click "Create" again
3. Configure:
   - **Model**: Select "text-embedding-ada-002"
   - **Model version**: Auto
   - **Deployment name**: `text-embedding-ada-002` (use this exact name)
4. Click "Create" and wait for deployment

### 4. Get Your API Keys

1. In your Azure OpenAI resource, click "Keys and Endpoint" in the left sidebar
2. You'll see:
   - **Endpoint**: Something like `https://your-resource-name.openai.azure.com/`
   - **Key 1**: Your primary API key
   - **Key 2**: Your secondary API key (can use either)

## 🔧 Configure Your Application

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/customer-support

# Required: Chat Configuration
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_API_KEY=your-key-1-here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-35-turbo
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Optional: Embedding Configuration (for semantic search)
AZURE_OPENAI_EMBEDDINGS_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME=text-embedding-ada-002

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Replace**:
- `your-resource-name` with your actual resource name from Azure Portal
- `your-key-1-here` with Key 1 from Azure Portal
- `your-super-secret-jwt-key-change-this-in-production` with a random secure string

## 💰 Understanding Free Tier

### What's Free

- **$200 Azure credits** valid for 30 days
- Can be used for:
  - Azure OpenAI API calls
  - Other Azure services
  - Includes: ~1 million tokens of GPT-3.5-turbo or ~100K tokens of GPT-4

### Cost After Free Tier

- **GPT-3.5-turbo**: ~$0.002 per 1K tokens
- **GPT-4**: ~$0.03 per 1K tokens  
- **Embeddings**: ~$0.0001 per 1K tokens

**To avoid charges**:
1. Set up spending alerts in Azure Portal
2. Consider using embeddings only (much cheaper)
3. Switch to OpenAI direct API after free tier

## 🔍 Testing Your Setup

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Check the logs for any connection errors

3. Test the chat functionality in your frontend

## ⚠️ Troubleshooting

### "Access Denied" Error
- Your Azure OpenAI request is still pending approval
- Wait 1-3 business days
- Check status in Azure Portal

### "Invalid API Key" Error
- Verify you copied the full key
- Make sure there are no extra spaces
- Regenerate the key if needed

### "Deployment Not Found" Error
- Verify deployment name matches exactly
- Check deployments section in Azure Portal
- Ensure deployment status is "Succeeded"

### "Quota Exceeded" Error
- You've used your free $200 credits
- Check usage in Azure Portal
- Consider creating a new account or upgrading

### Embeddings Not Working
- Verify embedding deployment is created
- Check deployment name is correct
- System will automatically fall back to keyword search

## 📚 Additional Resources

- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Azure Portal](https://portal.azure.com)
- [Azure Free Account FAQ](https://azure.microsoft.com/pricing/free-services/)

## 🔄 Alternative: Using OpenAI Direct API

If Azure approval takes too long:

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up for an account
3. Add payment method (required even for free tier)
4. Get $5 free credits
5. Update `.env` to use OpenAI's direct API (requires code changes)

## 🛡️ Security Best Practices

- **Never commit** your `.env` file to git
- **Regenerate keys** if accidentally exposed
- **Use Key 1** for production, keep Key 2 as backup
- **Set up spending limits** in Azure to prevent unexpected charges
- **Monitor usage** regularly in Azure Portal

---

**Need Help?** Open an issue in the repository or check the main README.md

