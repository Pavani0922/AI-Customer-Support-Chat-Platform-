# AI Customer Support Chat Platform

A full-stack AI-powered customer support chat application built with React, Node.js, Express, MongoDB, and OpenAI/Azure OpenAI.

## Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (running locally or MongoDB Atlas account)
- **OpenAI API Key** OR **Azure OpenAI API Key** (you need at least one)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mern-task
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/customer-support
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# IMPORTANT: Provide EITHER OpenAI OR Azure OpenAI configuration

# Option 1: OpenAI (Standard) - Recommended for simplicity
OPENAI_API_KEY=your-openai-api-key-here

# Option 2: Azure OpenAI (If you prefer Azure)
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-azure-openai-api-key
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-35-turbo
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Optional: Company name for personalized responses
COMPANY_NAME=Your Company Name
```

**Important Notes:**
- You **must** provide either `OPENAI_API_KEY` OR the Azure OpenAI configuration (`AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, etc.)
- The system will prioritize `OPENAI_API_KEY` if both are provided
- Get your OpenAI API key from [platform.openai.com](https://platform.openai.com)
- Get your Azure OpenAI keys from [Azure Portal](https://portal.azure.com)

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

### 1. Start MongoDB

Make sure MongoDB is running:

```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB

# Or use MongoDB Atlas connection string in MONGODB_URI
```

### 2. Start Backend Server

```bash
cd backend
npm run dev
```

The server will run on `http://localhost:5000`

### 3. Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The app will run on `http://localhost:5173`

## Initial Setup

### Create Admin User

Run the seed script to create an admin user:

```bash
cd backend
npm run seed:admin
```

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

## Usage

1. **Login** with admin credentials or register a new user
2. **Chat Interface**: Start chatting - AI will use FAQs for contextual answers
3. **Admin Panel**: 
   - Upload FAQs manually or via PDF/TXT files
   - Manage FAQs and view statistics
   - FAQs are automatically used for AI responses

## Features

- 🤖 AI-Powered Chat with OpenAI/Azure OpenAI
- 💬 Persistent conversation history
- 📚 FAQ management with file upload support
- 🔍 Semantic search with embeddings
- 🌐 Web search integration for enhanced answers
- 🎨 Modern dark theme UI
- 📱 Responsive design

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env` file

### OpenAI API Error
- Verify your API key is correct
- Check you have credits/quota available
- For Azure: Verify endpoint and deployment name

### CORS Errors
- Check `FRONTEND_URL` in backend `.env` matches your frontend port

## Security Note

⚠️ **Never commit your `.env` files to version control!** Add `.env` to your `.gitignore` file.

---

**Need Help?** Open an issue in the repository.
