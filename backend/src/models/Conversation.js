import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  messages: [messageSchema],
  title: {
    type: String,
    default: 'New Conversation'
  }
}, {
  timestamps: true
});

// Index for faster queries
conversationSchema.index({ userId: 1, createdAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;



