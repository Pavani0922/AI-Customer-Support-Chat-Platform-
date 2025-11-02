import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      const dataBuffer = fs.readFileSync(filePath);
      const parser = new PDFParse({ data: dataBuffer });
      const result = await parser.getText();
      await parser.destroy();
      return result.text || '';
    } catch (error) {
      console.error('PDF extraction error:', error);
      console.error('Error details:', error.message, error.stack);
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
   * Split text into chunks for processing
   * @param {string} text - The text to chunk
   * @param {number} maxChunkSize - Maximum characters per chunk
   * @returns {Array<string>} Array of text chunks
   */
  splitIntoChunks(text, maxChunkSize = 5000) {
    const chunks = [];
    let currentChunk = '';

    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxChunkSize) {
        currentChunk += sentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentence;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
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

