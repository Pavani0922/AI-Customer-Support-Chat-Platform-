import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'txt', 'manual'],
    default: 'manual'
  },
  fileName: {
    type: String
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  keywords: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  embedding: {
    type: [Number],
    sparse: true
  },
  embeddingStatus: {
    type: String,
    enum: ['generated', 'not_generated', 'failed', 'error'],
    default: 'not_generated'
  },
  contentLength: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for text search
faqSchema.index({ title: 'text', content: 'text', keywords: 'text' });

const FAQ = mongoose.model('FAQ', faqSchema);

export default FAQ;



