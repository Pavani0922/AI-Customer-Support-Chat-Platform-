import Conversation from '../models/Conversation.js';
import openAIService from './openAIService.js';
import faqService from './faqService.js';
import webSearchService from './webSearchService.js';

class ChatService {
  /**
   * Process user message and generate AI response
   */
  async processMessage(userId, sessionId, userMessage) {
    try {
      // 1. Get or create conversation
      let conversation = await Conversation.findOne({ 
        userId, 
        sessionId 
      });

      if (!conversation) {
        conversation = new Conversation({
          userId,
          sessionId,
          messages: []
        });
      }

      // 2. Add user message to conversation
      conversation.messages.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      });

      // 3. Search for relevant FAQs - increased limit for more comprehensive context
      const relevantFAQs = await faqService.searchFAQs(userMessage, 5);
      const faqContext = faqService.formatFAQsForContext(relevantFAQs);

      // Log FAQ usage for debugging
      if (relevantFAQs && relevantFAQs.length > 0) {
        console.log(`📚 Found ${relevantFAQs.length} relevant FAQ(s) for query: "${userMessage.substring(0, 50)}..."`);
        relevantFAQs.forEach((faq, idx) => {
          console.log(`   ${idx + 1}. ${faq.title} (score: ${faq.score?.toFixed(3) || 'N/A'})`);
        });
      } else {
        console.log(`📚 No relevant FAQs found for query: "${userMessage.substring(0, 50)}..."`);
      }

      // 4. Search the web for additional information if needed
      let webResults = [];
      let webContext = '';
      
      if (webSearchService.shouldUseWebSearch(userMessage, relevantFAQs)) {
        console.log(`🌐 Performing web search for: "${userMessage.substring(0, 50)}..."`);
        try {
          webResults = await webSearchService.searchWeb(userMessage, 3);
          if (webResults && webResults.length > 0) {
            webContext = webSearchService.formatWebResultsForContext(webResults);
            console.log(`✅ Found ${webResults.length} web result(s)`);
          } else {
            console.log(`⚠️ No web results found`);
          }
        } catch (error) {
          console.error('Web search error:', error);
          // Continue without web results if search fails
        }
      } else {
        console.log(`ℹ️ Skipping web search (sufficient FAQ results found)`);
      }

      // 5. Generate conversation summary for better context awareness
      // Get messages before the current one for summary
      const previousMessages = conversation.messages.slice(0, -1);
      const conversationSummary = openAIService.generateConversationSummary(previousMessages);

      // 6. Build enhanced system prompt with FAQ context, web context, and conversation summary
      const systemPrompt = openAIService.buildSystemPrompt(faqContext, conversationSummary, webContext);

      // 7. Prepare messages for OpenAI (last 10 messages for context)
      // This maintains conversational flow and context
      const recentMessages = conversation.messages
        .slice(-10)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // 8. Generate AI response with refined, company-specific responses
      const aiResponse = await openAIService.generateResponse(
        recentMessages,
        systemPrompt,
        {
          temperature: 0.7,      // Balanced creativity for natural, brand-aligned responses
          max_tokens: 600,      // Increased for detailed answers using FAQ specifics (3-6 sentences)
          top_p: 0.9,           // Nucleus sampling for better quality
          frequency_penalty: 0.3, // Reduce repetition for natural flow
          presence_penalty: 0.3   // Encourage natural, company-specific conversation
        }
      );

      // 9. Add AI response to conversation
      conversation.messages.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      });

      // 10. Update conversation title if it's the first message
      if (conversation.messages.length === 2) {
        conversation.title = userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : '');
      }

      // 11. Save conversation
      await conversation.save();

      return {
        response: aiResponse,
        conversationId: conversation._id
      };
    } catch (error) {
      console.error('Chat Service Error:', error);
      throw error;
    }
  }

  /**
   * Get conversation by ID
   */
  async getConversation(userId, conversationId) {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return conversation;
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId) {
    return await Conversation.find({ userId })
      .sort({ updatedAt: -1 })
      .select('title sessionId createdAt updatedAt messages')
      .lean();
  }
}

export default new ChatService();



