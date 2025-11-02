# AI Customer Support Chat Platform

A full-stack AI-powered customer support chat application built with React, Node.js, Express, MongoDB, and Azure OpenAI.

## Features

- 🤖 **AI-Powered Chat**: Interactive chat interface with Azure OpenAI (GPT-3.5/GPT-4)
- 💬 **Conversation Management**: Persistent chat history stored in MongoDB
- 📚 **FAQ/Company Data Management**: Admin panel to upload and manage FAQs
- 📄 **File Upload Support**: Upload PDF and TXT files with automatic text extraction
- 🔍 **Smart Search**: Embedding-based semantic search with fallback to keyword search
- 🎯 **Context-Aware Responses**: AI uses uploaded FAQs for contextual answers
- 🔐 **Authentication**: JWT-based authentication with role-based access (user/admin)
- 📱 **Responsive Design**: Clean, modern UI that works on all devices
- 🎨 **Modern UI**: Built with React and MobX for state management

## Tech Stack

### Frontend
- **React 18** with Vite
- **MobX** for state management
- **React Router** for navigation
- **Axios** for API calls
- **date-fns** for date formatting

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **Azure OpenAI** API integration (Chat + Embeddings)
- **JWT** for authentication
- **bcryptjs** for password hashing
- **pdf-parse** for PDF text extraction
- **Multer** for file uploads

## Project Structure

```
mern-task/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── stores/        # MobX stores
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── package.json
│
├── backend/           # Node.js backend application
│   ├── src/
│   │   ├── config/       # Database configuration
│   │   ├── controllers/  # Route controllers
│   │   ├── models/       # MongoDB models
│   │   ├── routes/       # Express routes
│   │   ├── services/     # Business logic services
│   │   └── middleware/   # Custom middleware
│   └── package.json
│
└── README.md
```

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **MongoDB** (running locally or MongoDB Atlas account)
- **Azure OpenAI** account with API access

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mern-task
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example if available)
# Configure your environment variables (see Configuration section below)
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
# Configure your environment variables (see Configuration section below)
```

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/customer-support
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-azure-openai-api-key
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Optional: For embedding-based semantic search (recommended)
AZURE_OPENAI_EMBEDDINGS_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME=your-embedding-deployment-name

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory with the following:

```env
VITE_API_URL=http://localhost:5000/api
```

### Azure OpenAI Setup

For detailed step-by-step instructions on getting Azure OpenAI keys for free, see [AZURE_SETUP.md](./AZURE_SETUP.md).

Quick summary:
1. Create an Azure account with free $200 credits (30 days)
2. Request access to Azure OpenAI (takes 1-3 days)
3. Deploy GPT model (gpt-35-turbo) for chat
4. (Optional) Deploy embedding model for semantic search
5. Copy endpoint, API keys, and deployment names to `.env`

**Note**: Without embedding configuration, the system will use keyword-based search instead of semantic search.

## Running the Application

### Start MongoDB

Make sure MongoDB is running on your system:

```bash
# If using local MongoDB
mongod

# Or start MongoDB service (varies by OS)
# macOS with Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### Start Backend Server

```bash
cd backend
npm run dev
# Server will run on http://localhost:5000
```

### Start Frontend Development Server

```bash
cd frontend
npm run dev
# App will run on http://localhost:5173
```

## Usage

### Initial Setup

1. **Register a User**:
   - Open the application in your browser
   - Click "Register" to create a new account
   - Default users have 'user' role

2. **Create an Admin User** (Optional):
   - Run the seed script to create an admin user:
   ```bash
   cd backend
   npm run seed:admin
   ```
   - Default credentials: username: `admin`, password: `admin123`
   - Or register normally and update the role in MongoDB manually

### Using the Application

1. **Chat Interface**:
   - Login to access the chat interface
   - Type your message and press Enter (or click Send)
   - AI will respond using context from uploaded FAQs

2. **Admin Panel** (Admin users only):
   - Navigate to "Admin Panel" from the navbar
   - Toggle between "Manual Input" and "Upload File (PDF/TXT)" modes
   - **Manual Input**: Enter title and content directly
   - **File Upload**: Upload PDF or TXT files with automatic text extraction
   - FAQs are automatically indexed with embeddings and used for contextual responses
   - Delete FAQs as needed

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user

### Chat
- `POST /api/chat/message` - Send message and get AI response
- `GET /api/chat/conversations` - Get all user conversations
- `GET /api/chat/conversations/:id` - Get specific conversation

### Admin (Admin only)
- `POST /api/admin/upload` - Upload new FAQ
- `GET /api/admin/data` - Get all FAQs
- `DELETE /api/admin/data/:id` - Delete FAQ

## Database Models

### User
- `username` (String, unique)
- `password` (String, hashed)
- `role` (String: 'user' or 'admin')

### Conversation
- `userId` (ObjectId, ref: User)
- `sessionId` (String)
- `messages` (Array of message objects)
- `title` (String)

### FAQ
- `title` (String)
- `content` (String)
- `fileType` (String: 'pdf', 'txt', or 'manual')
- `fileName` (String, optional)
- `uploadedBy` (ObjectId, ref: User)
- `keywords` (Array of Strings)
- `embedding` (Array of Numbers, optional - for semantic search)

## Development

### Backend Scripts
```bash
npm start      # Start production server
npm run dev    # Start development server with nodemon
```

### Frontend Scripts
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run preview # Preview production build
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running
   - Check MONGODB_URI in `.env` file
   - Verify MongoDB is accessible

2. **Azure OpenAI API Error**:
   - Verify your API key and endpoint
   - Check deployment name matches your Azure setup
   - Ensure you have quota/credits available

3. **CORS Errors**:
   - Check FRONTEND_URL in backend `.env`
   - Ensure frontend URL matches your dev server port

4. **Authentication Issues**:
   - Clear browser localStorage
   - Check JWT_SECRET is set
   - Verify token is being sent in requests

## Future Enhancements

- [x] File upload support (PDF, TXT) for FAQs
- [x] Embeddings-based similarity search
- [ ] Chat export functionality (TXT/PDF)
- [ ] Conversation search and filtering
- [ ] Multiple language support
- [ ] Real-time notifications
- [ ] Analytics dashboard
- [ ] Batch file upload
- [ ] Vector database integration (Pinecone, Weaviate)

## License

This project is licensed under the ISC License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues or questions, please open an issue in the repository.

---

**Note**: Make sure to keep your `.env` files secure and never commit them to version control. Add `.env` to your `.gitignore` file.

