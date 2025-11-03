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

    // Log document size for processing
    const contentLength = content.length;
    console.log(`📄 Processing ${fileType} document: "${title}" (${contentLength} characters)`);

    // Extract keywords from title and content
    const keywords = faqService.extractKeywords(`${title} ${content}`);
    console.log(`🔑 Extracted ${keywords.length} keywords`);

    // For large documents, prepare content for embedding generation
    // If content is very large, we'll use a summary approach for embedding
    let embedding = null;
    let embeddingStatus = 'not_generated';

    try {
      // Generate embedding for semantic search
      // For very large content (>8000 chars), create a summary for embedding
      let embeddingText = `${title} ${content}`;
      
      if (contentLength > 8000) {
        // For large documents, use title + first 2000 chars + last 2000 chars for embedding
        // This captures the main topic and key information
        const firstPart = content.substring(0, 2000);
        const lastPart = content.substring(content.length - 2000);
        embeddingText = `${title}\n\n${firstPart}\n\n... [middle content] ...\n\n${lastPart}`;
        console.log(`📝 Large document detected. Creating optimized embedding from title + key sections`);
      }

      embedding = await openAIService.generateEmbedding(embeddingText);
      
      if (embedding) {
        embeddingStatus = 'generated';
        console.log(`✅ Embedding generated successfully (${embedding.length} dimensions)`);
      } else {
        embeddingStatus = 'failed';
        console.log(`⚠️  Embedding generation failed or not configured, will use keyword search`);
      }
    } catch (error) {
      console.error('❌ Embedding generation error:', error.message);
      embeddingStatus = 'error';
      // Continue without embedding - keyword search will be used as fallback
    }

    // Create FAQ with all metadata
    const faq = new FAQ({
      title,
      content,
      uploadedBy,
      keywords,
      fileType,
      fileName,
      embedding,
      embeddingStatus,
      contentLength
    });

    await faq.save();

    console.log(`✅ FAQ saved successfully: "${title}" (ID: ${faq._id})`);

    res.status(201).json({
      success: true,
      message: `FAQ "${title}" uploaded successfully${embedding ? ' with embeddings' : ' (keyword search only)'}`,
      faq: {
        id: faq._id,
        title: faq.title,
        content: faq.content.substring(0, 200) + (faq.content.length > 200 ? '...' : ''),
        fileType: faq.fileType,
        fileName: faq.fileName,
        contentLength: faq.contentLength,
        embeddingStatus: faq.embeddingStatus,
        keywordsCount: faq.keywords?.length || 0,
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
      .select('title content fileType fileName contentLength embeddingStatus keywords createdAt')
      .lean();

    // Add summary stats
    const stats = {
      total: faqs.length,
      withEmbeddings: faqs.filter(f => f.embeddingStatus === 'generated').length,
      keywordOnly: faqs.filter(f => f.embeddingStatus !== 'generated').length,
      totalContentLength: faqs.reduce((sum, f) => sum + (f.contentLength || 0), 0)
    };

    res.json({
      success: true,
      faqs,
      stats
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

