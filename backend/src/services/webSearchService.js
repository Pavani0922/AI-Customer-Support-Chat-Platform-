// Import fetch - use global fetch if available (Node 18+), otherwise use node-fetch
import { default as nodeFetch } from 'node-fetch';

// Use global fetch if available (Node 18+), otherwise use node-fetch
const fetchFn = typeof fetch !== 'undefined' ? fetch : nodeFetch;

class WebSearchService {
  /**
   * Search the web for information related to a query
   * @param {string} query - Search query
   * @param {number} maxResults - Maximum number of results to return (default: 3)
   * @returns {Promise<Array>} Array of search results with title, url, snippet
   */
  async searchWeb(query, maxResults = 3) {
    try {
      // Try multiple search providers in order of preference
      // 1. DuckDuckGo Instant Answer API (free, no API key)
      const results = await this.searchDuckDuckGo(query, maxResults);
      
      if (results && results.length > 0) {
        return results;
      }

      // 2. Fallback: Use DuckDuckGo HTML search
      return await this.searchDuckDuckGoHTML(query, maxResults);
    } catch (error) {
      console.error('Web search error:', error);
      return [];
    }
  }

  /**
   * Search using DuckDuckGo Instant Answer API
   */
  async searchDuckDuckGo(query, maxResults) {
    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`;

      const response = await fetchFn(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      const results = [];

      // Extract AbstractText if available (instant answer)
      if (data.AbstractText) {
        results.push({
          title: data.Heading || query,
          url: data.AbstractURL || '',
          snippet: data.AbstractText,
          source: 'DuckDuckGo Instant Answer'
        });
      }

      // Extract RelatedTopics
      if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
        for (const topic of data.RelatedTopics.slice(0, maxResults - results.length)) {
          if (topic.Text) {
            results.push({
              title: topic.Text.split(' - ')[0] || topic.Text.substring(0, 60),
              url: topic.FirstURL || '',
              snippet: topic.Text,
              source: 'DuckDuckGo Related Topics'
            });
          }
        }
      }

      return results.slice(0, maxResults);
    } catch (error) {
      console.error('DuckDuckGo API search error:', error);
      return [];
    }
  }

  /**
   * Search using DuckDuckGo HTML (fallback)
   */
  async searchDuckDuckGoHTML(query, maxResults) {
    try {
      // For HTML scraping, we'll use a simpler approach
      // Note: This is a basic implementation. For production, consider using
      // a proper scraping library or a search API service
      const encodedQuery = encodeURIComponent(query);
      const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;

      const response = await fetchFn(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        return [];
      }

      // For now, return empty and let the service handle it
      // In production, you might want to parse HTML or use a scraping service
      return [];
    } catch (error) {
      console.error('DuckDuckGo HTML search error:', error);
      return [];
    }
  }

  /**
   * Format web search results for context
   * @param {Array} searchResults - Array of search results
   * @returns {string} Formatted string for context
   */
  formatWebResultsForContext(searchResults) {
    if (!searchResults || searchResults.length === 0) {
      return '';
    }

    let formatted = '\n\nADDITIONAL WEB INFORMATION:\n';
    formatted += 'The following information was found from web searches to supplement the FAQs:\n\n';

    searchResults.forEach((result, index) => {
      formatted += `${index + 1}. ${result.title}\n`;
      if (result.url) {
        formatted += `   Source: ${result.url}\n`;
      }
      formatted += `   ${result.snippet}\n\n`;
    });

    return formatted;
  }

  /**
   * Check if web search should be used based on query
   * @param {string} query - User query
   * @param {Array} faqResults - FAQ search results
   * @returns {boolean} Whether to perform web search
   */
  shouldUseWebSearch(query, faqResults) {
    // Use web search if:
    // 1. Few or no FAQ results found
    // 2. FAQ results have low relevance scores
    // 3. Query seems to need current/real-time information
    
    if (!faqResults || faqResults.length === 0) {
      return true;
    }

    // Check if FAQ results have low scores (indicating weak relevance)
    const avgScore = faqResults.reduce((sum, faq) => sum + (faq.score || 0), 0) / faqResults.length;
    if (avgScore < 0.6) {
      return true;
    }

    // Check for queries that might need current information
    const currentInfoKeywords = ['current', 'latest', 'recent', 'today', 'now', '2024', '2025'];
    const queryLower = query.toLowerCase();
    if (currentInfoKeywords.some(keyword => queryLower.includes(keyword))) {
      return true;
    }

    return false;
  }
}

export default new WebSearchService();

