import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use CommonJS require to import pdf-parse in ESM context
const require = createRequire(import.meta.url);
let pdfParseModule;

try {
  pdfParseModule = require('pdf-parse');
} catch (error) {
  console.error('Error requiring pdf-parse:', error);
  throw new Error('Failed to load pdf-parse module');
}

// pdf-parse exports PDFParse class - we need to instantiate it
// Create a wrapper function that uses the PDFParse class correctly
const pdfParse = async (buffer) => {
  // Check if PDFParse class exists
  if (!pdfParseModule.PDFParse) {
    throw new Error('PDFParse class not found in pdf-parse module');
  }
  
  try {
    // Create PDFParse instance
    const parser = new pdfParseModule.PDFParse({ data: buffer });
    // Get text from PDF
    const result = await parser.getText();
    // Return in expected format
    return { text: result.text || '' };
  } catch (error) {
    console.error('PDFParse error:', error);
    throw error;
  }
};

class FileService {
  /**
   * Extract text from a file based on its type
   * @param {string} filePath - Path to the uploaded file
   * @param {string} fileType - Type of file (pdf, txt)
   * @returns {Promise<string>} Extracted text content
   */
  async extractTextFromFile(filePath, fileType) {
    try {
      if (fileType === 'pdf') {
        return await this.extractTextFromPDF(filePath);
      } else if (fileType === 'txt') {
        return await this.extractTextFromTXT(filePath);
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      console.error('File extraction error:', error);
      // Re-throw with original error message for better debugging
      throw error;
    }
  }

  /**
   * Extract text from PDF file
   */
  async extractTextFromPDF(filePath) {
    try {
      // Validate pdfParse is available
      if (typeof pdfParse !== 'function') {
        throw new Error('pdfParse is not a function. PDF parsing module may not be loaded correctly.');
      }

      const dataBuffer = fs.readFileSync(filePath);
      
      // Call pdfParse with the buffer
      const data = await pdfParse(dataBuffer);
      
      // pdf-parse returns an object with text property
      if (data && typeof data === 'object' && 'text' in data) {
        return data.text || '';
      }
      
      // Fallback if structure is different
      if (typeof data === 'string') {
        return data;
      }
      
      throw new Error('Unexpected pdf-parse return format');
    } catch (error) {
      console.error('PDF extraction error:', error);
      console.error('Error details:', error.message);
      console.error('pdfParse type:', typeof pdfParse);
      
      // More descriptive error message
      if (error.message.includes('not a function')) {
        throw new Error(`PDF parsing module error: ${error.message}. Please check pdf-parse installation.`);
      }
      
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  /**
   * Extract text from TXT file
   */
  async extractTextFromTXT(filePath) {
    try {
      const text = fs.readFileSync(filePath, 'utf-8');
      return text;
    } catch (error) {
      console.error('TXT extraction error:', error);
      throw new Error('Failed to extract text from TXT file');
    }
  }

  /**
   * Split text into chunks for processing (optimized for embeddings)
   * @param {string} text - The text to chunk
   * @param {number} maxChunkSize - Maximum characters per chunk (default: 2000 for better embeddings)
   * @param {number} overlap - Character overlap between chunks to maintain context
   * @returns {Array<string>} Array of text chunks
   */
  splitIntoChunks(text, maxChunkSize = 2000, overlap = 200) {
    if (!text || text.length === 0) {
      return [];
    }

    const chunks = [];
    const cleanText = text.trim().replace(/\s+/g, ' ');

    // If text is smaller than chunk size, return as single chunk
    if (cleanText.length <= maxChunkSize) {
      return [cleanText];
    }

    // Split by paragraphs first for better semantic boundaries
    const paragraphs = cleanText.split(/\n\s*\n/);
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      const paragraphText = paragraph.trim();

      if (!paragraphText) continue;

      // If single paragraph exceeds chunk size, split by sentences
      if (paragraphText.length > maxChunkSize) {
        // Save current chunk if it exists
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }

        // Split large paragraph by sentences
        const sentences = paragraphText.match(/[^.!?]+[.!?]+/g) || [paragraphText];
        currentChunk = '';

        for (const sentence of sentences) {
          if ((currentChunk + sentence).length <= maxChunkSize) {
            currentChunk += sentence + ' ';
          } else {
            if (currentChunk.trim()) {
              chunks.push(currentChunk.trim());
            }
            // Add overlap from previous chunk
            const overlapText = currentChunk.slice(-overlap);
            currentChunk = overlapText + sentence + ' ';
          }
        }
      } else {
        // Check if adding paragraph would exceed chunk size
        if ((currentChunk + paragraphText).length <= maxChunkSize) {
          currentChunk += paragraphText + '\n\n';
        } else {
          // Save current chunk and start new one with overlap
          if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
          }
          const overlapText = currentChunk.slice(-overlap);
          currentChunk = overlapText + paragraphText + '\n\n';
        }
      }
    }

    // Add remaining chunk
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    // Ensure all chunks are within size limit
    return chunks.map(chunk => {
      if (chunk.length <= maxChunkSize) {
        return chunk;
      }
      // If still too large, force split
      const forcedChunks = [];
      for (let i = 0; i < chunk.length; i += maxChunkSize - overlap) {
        forcedChunks.push(chunk.slice(i, i + maxChunkSize));
      }
      return forcedChunks;
    }).flat().filter(chunk => chunk.trim().length > 0);
  }

  /**
   * Delete file from uploads directory
   */
  deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('File deletion error:', error);
    }
  }
}

export default new FileService();

