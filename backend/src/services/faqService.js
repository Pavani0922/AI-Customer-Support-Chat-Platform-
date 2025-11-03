import FAQ from '../models/FAQ.js';
import openAIService from './openAIService.js';

class FAQService {
  /**
   * Search FAQs using semantic search with embeddings or fallback to keyword search
   * @param {string} query - User's question
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} Relevant FAQ documents
   */
  async searchFAQs(query, limit = 5) {
    try {
      // Try semantic search first
      const semanticResults = await this.semanticSearch(query, limit);
      if (semanticResults && semanticResults.length > 0) {
        return semanticResults;
      }

      // Fallback to keyword-based search
      return await this.keywordSearch(query, limit);
    } catch (error) {
      console.error('FAQ Search Error:', error);
      // Fallback to keyword search on error
      return await this.keywordSearch(query, limit);
    }
  }

  /**
   * Semantic search using embeddings (cosine similarity)
   * @param {string} query - User's question
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} Relevant FAQ documents
   */
  async semanticSearch(query, limit = 5) {
    try {
      // Generate embedding for query
      const queryEmbedding = await openAIService.generateEmbedding(query);
      
      if (!queryEmbedding) {
        console.log('⚠️  Query embedding generation failed, falling back to keyword search');
        return null; // Fallback to keyword search
      }

      // Validate query embedding
      if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
        console.log('⚠️  Invalid query embedding structure, falling back to keyword search');
        return null;
      }

      console.log(`✅ Query embedding generated: ${queryEmbedding.length} dimensions`);

      // Get all FAQs with embeddings (only those with successfully generated embeddings)
      const faqs = await FAQ.find({ 
        embedding: { $exists: true, $ne: null, $ne: [] },
        embeddingStatus: 'generated'
      })
        .select('title content embedding keywords createdAt contentLength')
        .lean();

      if (faqs.length === 0) {
        console.log('📚 No FAQs with embeddings found, falling back to keyword search');
        return null; // No embeddings available
      }

      // Filter out FAQs with invalid embeddings
      const validFaqs = faqs.filter(faq => {
        const isValid = Array.isArray(faq.embedding) && 
                       faq.embedding.length > 0 && 
                       faq.embedding.length === queryEmbedding.length;
        if (!isValid) {
          console.warn(`⚠️  FAQ "${faq.title}" has invalid embedding (length: ${faq.embedding?.length || 0})`);
        }
        return isValid;
      });

      if (validFaqs.length === 0) {
        console.log('⚠️  No FAQs with valid embeddings found, falling back to keyword search');
        return null;
      }

      console.log(`🔍 Searching ${validFaqs.length} FAQs with valid embeddings for: "${query.substring(0, 50)}..."`);

      // Calculate cosine similarity for each FAQ
      const results = validFaqs
        .map(faq => {
          const similarity = this.cosineSimilarity(queryEmbedding, faq.embedding);
          // Validate similarity score
          if (isNaN(similarity) || similarity < 0 || similarity > 1) {
            console.warn(`⚠️  Invalid similarity score for FAQ "${faq.title}": ${similarity}`);
            return null;
          }
          return { ...faq, score: similarity };
        })
        .filter(item => item !== null) // Remove invalid results
        .filter(item => item.score >= 0.5) // Lower threshold to catch more relevant FAQs (0.5 = 50% similarity)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit * 2); // Get more candidates, then filter by quality

      // Filter by quality - keep top matches with good scores
      const qualityResults = results
        .filter(item => item.score >= 0.6) // Quality filter - at least 60% similarity for top results
        .slice(0, limit);

      if (qualityResults.length > 0) {
        console.log(`✅ Found ${qualityResults.length} relevant FAQs via semantic search (best match: ${qualityResults[0].score.toFixed(3)})`);
        return qualityResults;
      } else if (results.length > 0) {
        // If no high-quality matches, return the best available (even if below 0.6)
        console.log(`⚠️  Found ${results.length} FAQ(s) with lower similarity (best: ${results[0].score.toFixed(3)}), using them`);
        return results.slice(0, limit);
      } else {
        console.log(`⚠️  No FAQs met similarity threshold (0.5), falling back to keyword search`);
        return null;
      }
    } catch (error) {
      console.error('Semantic Search Error:', error);
      return null;
    }
  }

  /**
   * Keyword-based search using regex and relevance scoring
   * @param {string} query - User's question
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} Relevant FAQ documents
   */
  async keywordSearch(query, limit = 5) {
    try {
      const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
      
      if (searchTerms.length === 0) {
        return [];
      }

      // Build regex patterns for search
      const searchPattern = searchTerms.join('|');
      const regex = new RegExp(searchPattern, 'i');

      // Search in title, content, and keywords
      const results = await FAQ.find({
        $or: [
          { title: { $regex: regex } },
          { content: { $regex: regex } },
          { keywords: { $in: searchTerms } }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(limit * 2) // Get more results for scoring
      .lean();

      // Score and sort by relevance
      const scoredResults = results.map(faq => {
        const score = this.calculateRelevanceScore(faq, query, searchTerms);
        return { ...faq, score };
      });

      // Sort by score descending and return top results
      return scoredResults
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Keyword Search Error:', error);
      return [];
    }
  }

  /**
   * Calculate relevance score for a FAQ item
   */
  calculateRelevanceScore(faq, query, searchTerms) {
    let score = 0;
    const queryLower = query.toLowerCase();
    const titleLower = faq.title.toLowerCase();
    const contentLower = faq.content.toLowerCase();

    // Title matches are more important
    searchTerms.forEach(term => {
      if (titleLower.includes(term)) score += 3;
      if (contentLower.includes(term)) score += 1;
      if (faq.keywords && faq.keywords.includes(term)) score += 2;
    });

    // Exact phrase match bonus
    if (titleLower.includes(queryLower)) score += 5;
    if (contentLower.includes(queryLower)) score += 2;

    return score;
  }

  /**
   * Format FAQs for AI context
   */
  formatFAQsForContext(faqs) {
    if (!faqs || faqs.length === 0) {
      return '';
    }

    // Format FAQs with FULL content for detailed answers - no truncation
    // Include all relevant details so chatbot can provide comprehensive responses
    return faqs.map((faq, index) => {
      const score = faq.score ? ` (Relevance: ${(faq.score * 100).toFixed(1)}%)` : '';
      return `${index + 1}. ${faq.title}${score}\n\n${faq.content}\n`;
    }).join('\n---\n\n');
  }

  /**
   * Extract keywords from text
   */
  extractKeywords(text) {
    // Simple keyword extraction - can be enhanced
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
    
    // Return unique keywords, limited to top 10
    return [...new Set(words)].slice(0, 10);
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param {Array<number>} vecA - First vector
   * @param {Array<number>} vecB - Second vector
   * @returns {number} Cosine similarity score
   */
  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }
}

export default new FAQService();



