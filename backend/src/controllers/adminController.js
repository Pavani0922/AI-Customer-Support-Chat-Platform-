import FAQ from '../models/FAQ.js';
import faqService from '../services/faqService.js';
import fileService from '../services/fileService.js';
import openAIService from '../services/openAIService.js';
import path from 'path';

export const uploadFAQ = async (req, res, next) => {
  try {
    const uploadedBy = req.userId;
    let title, content, fileType = 'manual', fileName = null;

    // Check if it's a file upload or manual text input
    if (req.file) {
      // File upload
      const filePath = req.file.path;
      const extension = path.extname(req.file.originalname).toLowerCase();
      fileType = extension === '.pdf' ? 'pdf' : 'txt';
      fileName = req.file.originalname;

      try {
        // Extract text from file
        content = await fileService.extractTextFromFile(filePath, fileType);
      } catch (extractionError) {
        // Delete file on error to avoid leaving orphaned files
        fileService.deleteFile(filePath);
        return res.status(400).json({ 
          success: false,
          message: extractionError.message || 'Failed to extract text from file' 
        });
      }

      // Use filename (without extension) as title if not provided
      title = req.body.title || path.parse(fileName).name;

      // Delete uploaded file after processing
      fileService.deleteFile(filePath);
    } else {
      // Manual text input
      title = req.body.title;
      content = req.body.content;
    }

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // Extract keywords
    const keywords = faqService.extractKeywords(`${title} ${content}`);

    // Generate embedding for semantic search
    const embedding = await openAIService.generateEmbedding(`${title} ${content}`);

    // Create FAQ
    const faq = new FAQ({
      title,
      content,
      uploadedBy,
      keywords,
      fileType,
      fileName,
      embedding
    });

    await faq.save();

    res.status(201).json({
      success: true,
      faq: {
        id: faq._id,
        title: faq.title,
        content: faq.content,
        fileType: faq.fileType,
        fileName: faq.fileName,
        createdAt: faq.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getFAQs = async (req, res, next) => {
  try {
    const faqs = await FAQ.find()
      .sort({ createdAt: -1 })
      .select('title content fileType fileName createdAt')
      .lean();

    res.json({
      success: true,
      faqs
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFAQ = async (req, res, next) => {
  try {
    const { id } = req.params;

    const faq = await FAQ.findByIdAndDelete(id);

    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    res.json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

