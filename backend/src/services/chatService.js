import Conversation from '../models/Conversation.js';
import openAIService from './openAIService.js';
import faqService from './faqService.js';

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

      // 3. Search for relevant FAQs
      const relevantFAQs = await faqService.searchFAQs(userMessage, 3);
      const faqContext = faqService.formatFAQsForContext(relevantFAQs);

      // 4. Build system prompt with context
      const systemPrompt = openAIService.buildSystemPrompt(faqContext);

      // 5. Prepare messages for OpenAI (last 10 messages for context)
      const recentMessages = conversation.messages
        .slice(-10)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // 6. Generate AI response
      const aiResponse = await openAIService.generateResponse(
        recentMessages,
        systemPrompt
      );

      // 7. Add AI response to conversation
      conversation.messages.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      });

      // 8. Update conversation title if it's the first message
      if (conversation.messages.length === 2) {
        conversation.title = userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : '');
      }

      // 9. Save conversation
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



